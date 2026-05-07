import logging
import os
import re
import secrets
from datetime import datetime, timedelta, timezone

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from flask_mail import Message

from app import db, mail, limiter
from app.models import User

logger = logging.getLogger(__name__)
auth_bp = Blueprint('auth', __name__)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _is_valid_university_email(email: str) -> bool:
    """Accept only Wits/UJ student email addresses."""
    valid_domains = ('students.wits.ac.za', 'student.uj.ac.za')
    if '@' not in email:
        return False
    local, domain = email.split('@', 1)
    return domain in valid_domains and bool(re.match(r'^\d{6,10}$', local))


def _validate_password(password: str) -> str | None:
    """Return an error message or None if the password is acceptable."""
    if len(password) < 8:
        return 'Password must be at least 8 characters'
    if not re.search(r'[A-Za-z]', password):
        return 'Password must contain at least one letter'
    if not re.search(r'\d', password):
        return 'Password must contain at least one number'
    return None


def _generate_otp() -> str:
    """Cryptographically secure 6-digit OTP."""
    return f'{secrets.randbelow(900000) + 100000}'


def _make_jwt(user: User) -> str:
    return create_access_token(identity=str(user.id))


def _is_mail_configured() -> bool:
    return bool(current_app.config.get('MAIL_USERNAME') and current_app.config.get('MAIL_PASSWORD'))


def _send_verification_email(user_email: str, code: str) -> bool:
    if not _is_mail_configured():
        # Dev fallback — print to console so you can still test locally
        logger.warning(
            '\n' + '='*60 +
            f'\n  EMAIL NOT CONFIGURED — DEV MODE OTP' +
            f'\n  To: {user_email}' +
            f'\n  Code: {code}' +
            '\n' + '='*60
        )
        return False
    try:
        msg = Message(
            subject='Your oneApplyHub Verification Code',
            recipients=[user_email],
            html=f"""
            <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:12px;">
              <div style="text-align:center;margin-bottom:24px;">
                <h1 style="color:#1a5fa8;font-size:24px;margin:0;">oneApplyHub</h1>
                <p style="color:#64748b;font-size:13px;margin:4px 0 0;">Slogan</p>
              </div>
              <div style="background:#ffffff;border-radius:10px;padding:28px;border:1px solid #e2e8f0;">
                <h2 style="color:#1e293b;font-size:18px;margin-top:0;">Verify your email address</h2>
                <p style="color:#475569;font-size:14px;">Enter the code below to verify your university email and activate your account:</p>
                <div style="background:#f1f5f9;border-radius:8px;padding:20px;text-align:center;margin:20px 0;">
                  <span style="font-size:38px;font-weight:800;letter-spacing:10px;color:#1a5fa8;font-family:monospace;">{code}</span>
                </div>
                <p style="color:#94a3b8;font-size:12px;margin-bottom:0;">This code expires in <strong>15 minutes</strong>. If you did not register for oneApplyHub, please ignore this email.</p>
              </div>
            </div>
            """,
        )
        mail.send(msg)
        return True
    except Exception:
        logger.exception('Failed to send verification email to %s', user_email)
        return False


def _send_password_reset_email(user_email: str, reset_url: str) -> bool:
    if not _is_mail_configured():
        logger.warning(
            '\n' + '='*60 +
            f'\n  EMAIL NOT CONFIGURED — DEV MODE RESET LINK' +
            f'\n  To: {user_email}' +
            f'\n  URL: {reset_url}' +
            '\n' + '='*60
        )
        return False
    try:
        msg = Message(
            subject='Reset your oneApplyHub password',
            recipients=[user_email],
            html=f"""
            <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:12px;">
              <div style="text-align:center;margin-bottom:24px;">
                <h1 style="color:#1a5fa8;font-size:24px;margin:0;">oneApplyHub</h1>
                <p style="color:#64748b;font-size:13px;margin:4px 0 0;">Slogan</p>
              </div>
              <div style="background:#ffffff;border-radius:10px;padding:28px;border:1px solid #e2e8f0;">
                <h2 style="color:#1e293b;font-size:18px;margin-top:0;">Password Reset Request</h2>
                <p style="color:#475569;font-size:14px;">We received a request to reset your password. Click the button below to choose a new one:</p>
                <div style="text-align:center;margin:24px 0;">
                  <a href="{reset_url}" style="background:#1a5fa8;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;font-size:14px;">Reset Password</a>
                </div>
                <p style="color:#94a3b8;font-size:12px;margin-bottom:0;">This link expires in <strong>1 hour</strong>. If you did not request a password reset, please ignore this email.</p>
              </div>
            </div>
            """,
        )
        mail.send(msg)
        return True
    except Exception:
        logger.exception('Failed to send password reset email to %s', user_email)
        return False


def _tz_aware(dt: datetime | None) -> datetime | None:
    """Make a naive (SQLite) datetime timezone-aware."""
    if dt is None:
        return None
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@auth_bp.route('/register', methods=['POST'])
@limiter.limit('5 per minute; 20 per hour')
def register():
    data = request.get_json(silent=True) or {}

    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not name or not email or not password:
        return jsonify({'error': 'Name, email, and password are required'}), 400

    if not _is_valid_university_email(email):
        return jsonify({
            'error': 'Please use your university student email '
                     '(e.g. 2307134@students.wits.ac.za or 2307134@student.uj.ac.za)'
        }), 400

    pw_error = _validate_password(password)
    if pw_error:
        return jsonify({'error': pw_error}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 409

    university = 'wits' if 'wits' in email else 'uj'
    code = _generate_otp()

    user = User(
        email=email,
        name=name,
        university=university,
        year_of_study=data.get('year_of_study'),
        faculty=data.get('faculty'),
        verified=False,
        verification_code=code,
        verification_code_expires=_utcnow() + timedelta(minutes=15),
    )
    user.set_password(password)

    try:
        db.session.add(user)
        db.session.commit()
    except Exception:
        logger.exception('Registration DB error for %s', email)
        db.session.rollback()
        return jsonify({'error': 'Registration failed'}), 500

    _send_verification_email(email, code)

    return jsonify({
        'message': 'Registration successful. Check your university email for the verification code.',
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
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
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

    # Don't reveal whether the account exists
    if not user or user.verified:
        return jsonify({'message': 'If an unverified account exists, a code has been sent'}), 200

    code = _generate_otp()
    user.verification_code = code
    user.verification_code_expires = _utcnow() + timedelta(minutes=15)

    try:
        db.session.commit()
    except Exception:
        logger.exception('DB error during send-verification for %s', email)
        db.session.rollback()
        return jsonify({'error': 'Failed to send verification code'}), 500

    _send_verification_email(email, code)
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
    # Constant-time failure to avoid user enumeration
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
        or _utcnow() > expires
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
            # Only allow verified university student emails via Google OAuth
            if not _is_valid_university_email(g_email):
                return jsonify({
                    'error': 'Google sign-in is only available for Wits and UJ student email accounts. '
                             'Please use your student email (e.g. 2307134@students.wits.ac.za).'
                }), 403

            university = 'wits' if 'wits' in g_email else 'uj'

            user = User(
                email=g_email,
                name=g_name,
                university=university,
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
    # Always return the same response to prevent user enumeration
    if user:
        token = secrets.token_urlsafe(32)
        user.reset_token = token
        user.reset_token_expires = _utcnow() + timedelta(hours=1)
        try:
            db.session.commit()
        except Exception:
            logger.exception('DB error during forgot-password for %s', email)
            db.session.rollback()
            return jsonify({'error': 'Failed to process request'}), 500

        frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
        _send_password_reset_email(email, f'{frontend_url}/reset-password?token={token}')

    return jsonify({'message': 'If an account exists, a password reset email has been sent'}), 200


@auth_bp.route('/reset-password', methods=['POST'])
@limiter.limit('5 per minute')
def reset_password():
    data = request.get_json(silent=True) or {}
    token = data.get('token') or ''
    new_password = data.get('password') or ''

    if not token or not new_password:
        return jsonify({'error': 'Token and new password are required'}), 400

    pw_error = _validate_password(new_password)
    if pw_error:
        return jsonify({'error': pw_error}), 400

    user = User.query.filter_by(reset_token=token).first()
    if not user:
        return jsonify({'error': 'Invalid or expired reset token'}), 400

    expires = _tz_aware(user.reset_token_expires)
    if expires is None or _utcnow() > expires:
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
