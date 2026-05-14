import logging
import secrets
from datetime import timedelta, timezone

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from app import db, limiter
from app.models import User
from app.utils import utcnow, is_valid_university_email, validate_password, university_from_email
from app.mailer import send_verification_email, send_password_reset_email
import os

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
        return jsonify({'error': 'Email already registered'}), 409

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

    send_verification_email(email, otp)

    # Return a token so the user can access the dashboard immediately
    return jsonify({
        'message': 'Registration successful. Check your university email for the verification code.',
        'access_token': _make_jwt(user),
        'user': user.to_dict(),
        'email': email,
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
        return jsonify({'error': 'Failed to send verification code'}), 500

    send_verification_email(email, otp)
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
        return jsonify({
            'message': 'Account already verified',
            'access_token': _make_jwt(user),
            'user': user.to_dict(),
        }), 200

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

    return jsonify({
        'message': 'Email verified successfully',
        'access_token': _make_jwt(user),
        'user': user.to_dict(),
    }), 200


@auth_bp.route('/google/verify', methods=['POST'])
@limiter.limit('10 per minute')
def google_verify():
    data = request.get_json(silent=True) or {}
    id_token_str = data.get('id_token') or data.get('credential')

    if not id_token_str:
        return jsonify({'error': 'Google ID token is required'}), 400

    from flask import current_app
    google_client_id = current_app.config.get('GOOGLE_CLIENT_ID')
    if not google_client_id:
        return jsonify({'error': 'Google OAuth is not configured on this server'}), 501

    try:
        from google.oauth2 import id_token as google_id_token
        from google.auth.transport import requests as google_requests
        idinfo = google_id_token.verify_oauth2_token(
            id_token_str,
            google_requests.Request(),
            google_client_id,
        )
    except Exception:
        logger.warning('Google token verification failed')
        return jsonify({'error': 'Invalid Google token'}), 401

    google_id = idinfo['sub']
    g_email = idinfo.get('email', '').lower()
    g_name = idinfo.get('name') or g_email.split('@')[0]

    user = User.query.filter_by(google_id=google_id).first()
    if not user:
        user = User.query.filter_by(email=g_email).first()
        if user:
            user.google_id = google_id
            user.oauth_provider = 'google'
            user.verified = True
        else:
            if not is_valid_university_email(g_email):
                return jsonify({
                    'error': 'Google sign-in is only available for Wits and UJ student email accounts. '
                             'Please use your student email (e.g. 2307134@students.wits.ac.za).'
                }), 403

            user = User(
                email=g_email,
                name=g_name,
                university=university_from_email(g_email),
                verified=True,
                google_id=google_id,
                oauth_provider='google',
            )
            db.session.add(user)

        try:
            db.session.commit()
        except Exception:
            logger.exception('DB error during Google sign-in for %s', g_email)
            db.session.rollback()
            return jsonify({'error': 'Google sign-in failed'}), 500

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
        send_password_reset_email(email, f'{frontend_url}/reset-password?token={token}')

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
