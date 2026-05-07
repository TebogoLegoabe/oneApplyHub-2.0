import logging

from flask import current_app
from flask_mail import Message

from app import mail

logger = logging.getLogger(__name__)


def _is_mail_configured() -> bool:
    return bool(current_app.config.get('MAIL_USERNAME') and current_app.config.get('MAIL_PASSWORD'))


def _dev_warn(label: str, to: str, info: str) -> None:
    logger.warning('\n%s\n  EMAIL NOT CONFIGURED — DEV MODE %s\n  To: %s\n  %s\n%s',
                   '=' * 60, label, to, info, '=' * 60)


def _wrap(title: str, body: str) -> str:
    return f"""
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:12px;">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="color:#1a5fa8;font-size:24px;margin:0;">oneApplyHub</h1>
      </div>
      <div style="background:#fff;border-radius:10px;padding:28px;border:1px solid #e2e8f0;">
        <h2 style="color:#1e293b;font-size:18px;margin-top:0;">{title}</h2>
        {body}
      </div>
    </div>
    """


def send_verification_email(to: str, code: str) -> bool:
    if not _is_mail_configured():
        _dev_warn('OTP', to, f'Code: {code}')
        return False
    body = f"""
        <p style="color:#475569;font-size:14px;">Enter the code below to verify your university email and activate your account:</p>
        <div style="background:#f1f5f9;border-radius:8px;padding:20px;text-align:center;margin:20px 0;">
          <span style="font-size:38px;font-weight:800;letter-spacing:10px;color:#1a5fa8;font-family:monospace;">{code}</span>
        </div>
        <p style="color:#94a3b8;font-size:12px;margin-bottom:0;">This code expires in <strong>15 minutes</strong>. If you did not register for oneApplyHub, please ignore this email.</p>
    """
    try:
        mail.send(Message(
            subject='Your oneApplyHub Verification Code',
            recipients=[to],
            html=_wrap('Verify your email address', body),
        ))
        return True
    except Exception:
        logger.exception('Failed to send verification email to %s', to)
        return False


def send_password_reset_email(to: str, reset_url: str) -> bool:
    if not _is_mail_configured():
        _dev_warn('RESET LINK', to, f'URL: {reset_url}')
        return False
    body = f"""
        <p style="color:#475569;font-size:14px;">We received a request to reset your password. Click the button below to choose a new one:</p>
        <div style="text-align:center;margin:24px 0;">
          <a href="{reset_url}" style="background:#1a5fa8;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;font-size:14px;">Reset Password</a>
        </div>
        <p style="color:#94a3b8;font-size:12px;margin-bottom:0;">This link expires in <strong>1 hour</strong>. If you did not request a password reset, please ignore this email.</p>
    """
    try:
        mail.send(Message(
            subject='Reset your oneApplyHub password',
            recipients=[to],
            html=_wrap('Password Reset Request', body),
        ))
        return True
    except Exception:
        logger.exception('Failed to send password reset email to %s', to)
        return False
