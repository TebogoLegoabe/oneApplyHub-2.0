import base64
import io
import json
import logging
import os
import secrets
from datetime import timedelta, timezone

import pyotp
import qrcode
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from app import db, limiter
from app.models import User
from app.utils import utcnow, is_valid_university_email, validate_password, university_from_email
from app.mailer import send_verification_email, send_password_reset_email

logger = logging.getLogger(__name__)
auth_bp = Blueprint('auth', __name__)


def _make_jwt(user: User) -> str:
    return create_access_token(identity=str(user.id))


def _generate_otp() -> str:
    return str(secrets.randbelow(900000) + 100000)


def _tz_aware(dt):
    if dt is None:
        return None
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


def _check_backup_code(user: User, code: str) -> bool:
    if not user.mfa_backup_codes:
        return False
    codes = json.loads(user.mfa_backup_codes)
    normalized = code.upper().strip().replace('-', '').replace(' ', '')
    if normalized in codes:
        codes.remove(normalized)
        user.mfa_backup_codes = json.dumps(codes)
        return True
    return False


@auth_bp.route('/register', methods=['POST'])
@limiter.limit('5 per minute; 20 per hour')
def register():
    data = request.get_json(silent=True) or {}
    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not name or not email or not password:
        return jsonify({'error': 'Name, email, and password are required'}), 400

    if not is_valid_university_email(email):
        return jsonify({
            'error': 'Please use your university student email '
                     '(e.g. 2307134@students.wits.ac.za or 2307134@student.uj.ac.za)'
        }), 400

    pw_error = validate_password(password)
    if pw_error:
        return jsonify({'error': pw_error}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered. Please log in or resend your verification code.'}), 409

    otp = _generate_otp()
    user = User(
        email=email,
        name=name,
        university=university_from_email(email),
        year_of_study=data.get('year_of_study'),
        faculty=data.get('faculty'),
        verified=False,
        verification_code=otp,
        verification_code_expires=utcnow() + timedelta(minutes=15),
    )
    user.set_password(password)

    try:
        db.session.add(user)
        db.session.commit()
    except Exception:
        logger.exception('Registration DB error for %s', email)
        db.session.rollback()
        return jsonify({'error': 'Registration failed'}), 500

    email_sent = send_verification_email(email, otp)
    if not email_sent:
        logger.warning('Verification email could not be sent to %s', email)

    return jsonify({
        'message': 'Registration successful. Verify your email, then sign in.',
        'email': email,
        'verification_email_sent': email_sent,
    }), 201


@auth_bp.route('/login', methods=['POST'])
@limiter.limit('10 per minute; 50 per hour')
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid email or password'}), 401

    if not user.verified:
        return jsonify({'error': 'Please verify your email before signing in.'}), 403

    if user.mfa_enabled:
        pending_token = secrets.token_urlsafe(32)
        user.mfa_pending_token = pending_token
        user.mfa_pending_expires = utcnow() + timedelta(minutes=5)
        try:
            db.session.commit()
        except Exception:
            logger.exception('DB error during MFA login for %s', email)
            db.session.rollback()
            return jsonify({'error': 'Login failed'}), 500
        return jsonify({'mfa_required': True, 'mfa_token': pending_token}), 200

    return jsonify({'access_token': _make_jwt(user), 'user': user.to_dict()}), 200


@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user = db.session.get(User, int(get_jwt_identity()))
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'user': user.to_dict()}), 200


@auth_bp.route('/send-verification', methods=['POST'])
@limiter.limit('3 per minute; 10 per hour')
def send_verification():
    data = request.get_json(silent=True) or {}
    email = (data.get('email') or '').strip().lower()

    if not email:
        return jsonify({'error': 'Email is required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or user.verified:
        return jsonify({'message': 'If an unverified account exists, a code has been sent'}), 200

    otp = _generate_otp()
    user.verification_code = otp
    user.verification_code_expires = utcnow() + timedelta(minutes=15)

    try:
        db.session.commit()
    except Exception:
        logger.exception('DB error during send-verification for %s', email)
        db.session.rollback()
        return jsonify({'error': 'Failed to prepare verification code'}), 500

    if not send_verification_email(email, otp):
        return jsonify({'error': 'Could not send verification email. Please try again later.'}), 503

    return jsonify({'message': 'Verification code sent'}), 200


@auth_bp.route('/verify-email', methods=['POST'])
@limiter.limit('10 per minute')
def verify_email():
    data = request.get_json(silent=True) or {}
    email = (data.get('email') or '').strip().lower()
    code = (data.get('code') or '').strip()

    if not email or not code:
        return jsonify({'error': 'Email and code are required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'Invalid or expired verification code'}), 400

    if user.verified:
        return jsonify({'message': 'Account already verified'}), 200

    expires = _tz_aware(user.verification_code_expires)
    if (
        not user.verification_code
        or not secrets.compare_digest(user.verification_code, code)
        or expires is None
        or utcnow() > expires
    ):
        return jsonify({'error': 'Invalid or expired verification code'}), 400

    user.verified = True
    user.verification_code = None
    user.verification_code_expires = None

    try:
        db.session.commit()
    except Exception:
        logger.exception('DB error during email verification for %s', email)
        db.session.rollback()
        return jsonify({'error': 'Verification failed'}), 500

    return jsonify({'message': 'Email verified successfully. You can now sign in.'}), 200


@auth_bp.route('/google/verify', methods=['POST'])
@limiter.limit('10 per minute')
def google_verify():
    import requests as http_requests
    from flask import current_app

    data = request.get_json(silent=True) or {}
    google_client_id = current_app.config.get('GOOGLE_CLIENT_ID')
    if not google_client_id:
        return jsonify({'error': 'Google OAuth is not configured on this server'}), 501

    access_token = data.get('access_token')
    id_token_str = data.get('id_token') or data.get('credential')

    if access_token:
        try:
            resp = http_requests.get(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                headers={'Authorization': f'Bearer {access_token}'},
                timeout=5,
            )
            if not resp.ok:
                return jsonify({'error': 'Invalid Google token — please try signing in again'}), 401
            idinfo = resp.json()
        except Exception as exc:
            logger.exception('Google userinfo request failed: %s', exc)
            return jsonify({'error': 'Could not verify Google token — server error'}), 500
    elif id_token_str:
        try:
            from google.oauth2 import id_token as google_id_token
            from google.auth.transport import requests as google_requests
            idinfo = google_id_token.verify_oauth2_token(
                id_token_str, google_requests.Request(), google_client_id,
            )
        except ValueError as exc:
            logger.warning('Google token invalid: %s', exc)
            return jsonify({'error': 'Invalid Google token — please try signing in again'}), 401
        except Exception as exc:
            logger.exception('Google token verification error: %s', exc)
            return jsonify({'error': 'Could not verify Google token — server error'}), 500
    else:
        return jsonify({'error': 'Google token is required'}), 400

    google_id = idinfo.get('sub')
    g_email = idinfo.get('email', '').lower()

    if not google_id or not g_email:
        return jsonify({'error': 'Could not retrieve account info from Google'}), 401

    user = User.query.filter_by(google_id=google_id).first()
    if not user:
        user = User.query.filter_by(email=g_email).first()
        if not user:
            return jsonify({'error': 'Please create an account first, then sign in with Google.'}), 404
        if not user.verified:
            return jsonify({'error': 'Please verify your email before signing in with Google.'}), 403
        user.google_id = google_id
        user.oauth_provider = 'google'
        try:
            db.session.commit()
        except Exception:
            logger.exception('DB error linking Google sign-in for %s', g_email)
            db.session.rollback()
            return jsonify({'error': 'Google sign-in failed'}), 500

    if not user.verified:
        return jsonify({'error': 'Please verify your email before signing in with Google.'}), 403

    return jsonify({'access_token': _make_jwt(user), 'user': user.to_dict()}), 200


@auth_bp.route('/forgot-password', methods=['POST'])
@limiter.limit('3 per minute; 10 per hour')
def forgot_password():
    data = request.get_json(silent=True) or {}
    email = (data.get('email') or '').strip().lower()

    if not email:
        return jsonify({'error': 'Email is required'}), 400

    user = User.query.filter_by(email=email).first()
    if user:
        token = secrets.token_urlsafe(32)
        user.reset_token = token
        user.reset_token_expires = utcnow() + timedelta(hours=1)
        try:
            db.session.commit()
        except Exception:
            logger.exception('DB error during forgot-password for %s', email)
            db.session.rollback()
            return jsonify({'error': 'Failed to process request'}), 500

        frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
        if not send_password_reset_email(email, f'{frontend_url}/reset-password?token={token}'):
            return jsonify({'error': 'Could not send password reset email. Please try again later.'}), 503

    return jsonify({'message': 'If an account exists, a password reset email has been sent'}), 200


@auth_bp.route('/reset-password', methods=['POST'])
@limiter.limit('5 per minute')
def reset_password():
    data = request.get_json(silent=True) or {}
    token = data.get('token') or ''
    new_password = data.get('password') or ''

    if not token or not new_password:
        return jsonify({'error': 'Token and new password are required'}), 400

    pw_error = validate_password(new_password)
    if pw_error:
        return jsonify({'error': pw_error}), 400

    user = User.query.filter_by(reset_token=token).first()
    if not user:
        return jsonify({'error': 'Invalid or expired reset token'}), 400

    expires = _tz_aware(user.reset_token_expires)
    if expires is None or utcnow() > expires:
        return jsonify({'error': 'Invalid or expired reset token'}), 400

    user.set_password(new_password)
    user.reset_token = None
    user.reset_token_expires = None

    try:
        db.session.commit()
    except Exception:
        logger.exception('DB error during password reset')
        db.session.rollback()
        return jsonify({'error': 'Failed to reset password'}), 500

    return jsonify({'message': 'Password reset successful'}), 200


@auth_bp.route('/mfa/verify-login', methods=['POST'])
@limiter.limit('10 per minute')
def mfa_verify_login():
    data = request.get_json(silent=True) or {}
    mfa_token = (data.get('mfa_token') or '').strip()
    code = (data.get('code') or '').strip()

    if not mfa_token or not code:
        return jsonify({'error': 'MFA token and code are required'}), 400

    user = User.query.filter_by(mfa_pending_token=mfa_token).first()
    if not user:
        return jsonify({'error': 'Invalid or expired MFA session — please log in again'}), 401

    expires = _tz_aware(user.mfa_pending_expires)
    if expires is None or utcnow() > expires:
        user.mfa_pending_token = None
        user.mfa_pending_expires = None
        db.session.commit()
        return jsonify({'error': 'MFA session expired — please log in again'}), 401

    if _check_backup_code(user, code):
        user.mfa_pending_token = None
        user.mfa_pending_expires = None
        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            return jsonify({'error': 'Login failed'}), 500
        return jsonify({'access_token': _make_jwt(user), 'user': user.to_dict()}), 200

    totp = pyotp.TOTP(user.mfa_secret)
    if not totp.verify(code, valid_window=1):
        return jsonify({'error': 'Invalid authenticator code'}), 400

    user.mfa_pending_token = None
    user.mfa_pending_expires = None
    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({'error': 'Login failed'}), 500

    return jsonify({'access_token': _make_jwt(user), 'user': user.to_dict()}), 200


@auth_bp.route('/mfa/setup', methods=['POST'])
@jwt_required()
@limiter.limit('5 per minute')
def mfa_setup():
    user = db.session.get(User, int(get_jwt_identity()))
    if not user:
        return jsonify({'error': 'User not found'}), 404
    if user.mfa_enabled:
        return jsonify({'error': 'MFA is already enabled'}), 400

    secret = pyotp.random_base32()
    totp = pyotp.TOTP(secret)
    uri = totp.provisioning_uri(name=user.email, issuer_name='oneApplyHub')

    qr = qrcode.QRCode(box_size=10, border=2)
    qr.add_data(uri)
    qr.make(fit=True)
    img = qr.make_image(fill_color='black', back_color='white')
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    qr_b64 = base64.b64encode(buf.getvalue()).decode()

    user.mfa_secret = secret
    try:
        db.session.commit()
    except Exception:
        logger.exception('DB error during MFA setup for user %s', user.id)
        db.session.rollback()
        return jsonify({'error': 'Failed to generate MFA setup'}), 500

    return jsonify({'qr_code': qr_b64, 'secret': secret}), 200


@auth_bp.route('/mfa/enable', methods=['POST'])
@jwt_required()
@limiter.limit('5 per minute')
def mfa_enable():
    user = db.session.get(User, int(get_jwt_identity()))
    if not user:
        return jsonify({'error': 'User not found'}), 404
    if user.mfa_enabled:
        return jsonify({'error': 'MFA is already enabled'}), 400
    if not user.mfa_secret:
        return jsonify({'error': 'Call /mfa/setup first'}), 400

    data = request.get_json(silent=True) or {}
    code = (data.get('code') or '').strip()
    if not code:
        return jsonify({'error': 'Authenticator code is required'}), 400

    totp = pyotp.TOTP(user.mfa_secret)
    if not totp.verify(code, valid_window=1):
        return jsonify({'error': 'Invalid authenticator code — try again'}), 400

    backup_codes = [secrets.token_hex(4).upper() for _ in range(8)]
    user.mfa_enabled = True
    user.mfa_backup_codes = json.dumps(backup_codes)
    try:
        db.session.commit()
    except Exception:
        logger.exception('DB error enabling MFA for user %s', user.id)
        db.session.rollback()
        return jsonify({'error': 'Failed to enable MFA'}), 500

    return jsonify({'backup_codes': backup_codes, 'user': user.to_dict()}), 200


@auth_bp.route('/mfa/disable', methods=['POST'])
@jwt_required()
@limiter.limit('5 per minute')
def mfa_disable():
    user = db.session.get(User, int(get_jwt_identity()))
    if not user:
        return jsonify({'error': 'User not found'}), 404
    if not user.mfa_enabled:
        return jsonify({'error': 'MFA is not enabled'}), 400

    data = request.get_json(silent=True) or {}
    password = data.get('password') or ''
    code = (data.get('code') or '').strip()

    if not password and not user.oauth_provider:
        return jsonify({'error': 'Password confirmation is required'}), 400

    if user.password_hash and not user.check_password(password):
        return jsonify({'error': 'Incorrect password'}), 401

    if code:
        totp = pyotp.TOTP(user.mfa_secret)
        if not totp.verify(code, valid_window=1):
            return jsonify({'error': 'Invalid authenticator code'}), 400

    user.mfa_enabled = False
    user.mfa_secret = None
    user.mfa_backup_codes = None
    try:
        db.session.commit()
    except Exception:
        logger.exception('DB error disabling MFA for user %s', user.id)
        db.session.rollback()
        return jsonify({'error': 'Failed to disable MFA'}), 500

    return jsonify({'message': 'MFA disabled successfully', 'user': user.to_dict()}), 200
