import os
import logging
from datetime import timedelta

basedir = os.path.abspath(os.path.dirname(__file__))

logger = logging.getLogger(__name__)


class Config:
    # -------------------------------------------------------------------------
    # Core secrets — fail loudly in production if not set
    # -------------------------------------------------------------------------
    SECRET_KEY = os.environ.get('SECRET_KEY')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')

    @classmethod
    def validate(cls):
        """Call from create_app() to hard-fail on missing production secrets."""
        env = os.environ.get('FLASK_ENV', 'production')
        if env != 'development':
            missing = []
            if not cls.SECRET_KEY:
                missing.append('SECRET_KEY')
            if not cls.JWT_SECRET_KEY:
                missing.append('JWT_SECRET_KEY')
            if missing:
                raise RuntimeError(
                    f"Missing required environment variables: {', '.join(missing)}"
                )
        # Safe defaults for local development only
        if not cls.SECRET_KEY:
            logger.warning('SECRET_KEY not set — using insecure dev default')
            cls.SECRET_KEY = 'dev-secret-CHANGE-IN-PRODUCTION'
        if not cls.JWT_SECRET_KEY:
            logger.warning('JWT_SECRET_KEY not set — using insecure dev default')
            cls.JWT_SECRET_KEY = 'dev-jwt-CHANGE-IN-PRODUCTION'

    # -------------------------------------------------------------------------
    # Database
    # -------------------------------------------------------------------------
    _db_url = os.environ.get('DATABASE_URL', f'sqlite:///{os.path.join(basedir, "studentstay.db")}')
    # Railway uses postgres:// (deprecated) — normalise to postgresql://
    if _db_url.startswith('postgres://'):
        _db_url = _db_url.replace('postgres://', 'postgresql://', 1)
    SQLALCHEMY_DATABASE_URI = _db_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 300,
    }

    # -------------------------------------------------------------------------
    # JWT
    # -------------------------------------------------------------------------
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_ALGORITHM = 'HS256'

    # -------------------------------------------------------------------------
    # Flask-Mail
    # -------------------------------------------------------------------------
    MAIL_SERVER = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 587))
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'true').lower() in ('true', 'on', '1')
    MAIL_USE_SSL = False
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER', 'noreply@oneapplyhub.co.za')

    # -------------------------------------------------------------------------
    # Google OAuth
    # -------------------------------------------------------------------------
    GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')

    # -------------------------------------------------------------------------
    # Rate limiting (Flask-Limiter)
    # -------------------------------------------------------------------------
    RATELIMIT_STORAGE_URI = os.environ.get('REDIS_URL', 'memory://')
    RATELIMIT_STRATEGY = 'fixed-window'
    RATELIMIT_HEADERS_ENABLED = True

    # -------------------------------------------------------------------------
    # Request size guard
    # -------------------------------------------------------------------------
    MAX_CONTENT_LENGTH = 2 * 1024 * 1024  # 2 MB

    # -------------------------------------------------------------------------
    # HTTPS in production
    # -------------------------------------------------------------------------
    if os.environ.get('RAILWAY_ENVIRONMENT') or os.environ.get('FLASK_ENV') == 'production':
        PREFERRED_URL_SCHEME = 'https'
        SESSION_COOKIE_SECURE = True
        SESSION_COOKIE_HTTPONLY = True
        SESSION_COOKIE_SAMESITE = 'Lax'
