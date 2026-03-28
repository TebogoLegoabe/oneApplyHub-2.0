from datetime import datetime, timezone

from werkzeug.security import check_password_hash, generate_password_hash

from app import db


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(db.Model):
    __tablename__ = 'user'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256))
    name = db.Column(db.String(100), nullable=False)
    university = db.Column(db.String(50), nullable=False)
    year_of_study = db.Column(db.String(20))
    faculty = db.Column(db.String(100))
    verified = db.Column(db.Boolean, default=False, nullable=False)
    is_admin = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=_utcnow, nullable=False)

    # Password reset (token is single-use and expiring)
    reset_token = db.Column(db.String(100), nullable=True, index=True)
    reset_token_expires = db.Column(db.DateTime(timezone=True), nullable=True)

    # Email OTP verification
    verification_code = db.Column(db.String(6), nullable=True)
    verification_code_expires = db.Column(db.DateTime(timezone=True), nullable=True)

    # Google OAuth
    google_id = db.Column(db.String(100), nullable=True, unique=True)
    oauth_provider = db.Column(db.String(20), nullable=True)  # 'google' or None

    # Relationships
    reviews = db.relationship('Review', backref='author', lazy='dynamic')

    def set_password(self, password: str) -> None:
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash, password)

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'university': self.university,
            'year_of_study': self.year_of_study,
            'faculty': self.faculty,
            'verified': self.verified,
            'is_admin': self.is_admin,
            'oauth_provider': self.oauth_provider,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
