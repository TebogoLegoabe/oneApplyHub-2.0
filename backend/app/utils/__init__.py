import re
from datetime import datetime, timezone


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def is_valid_university_email(email: str) -> bool:
    """Backward-compatible name: accept any normal email address for learners and students."""
    return bool(re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', email or ''))


def validate_password(password: str) -> str | None:
    """Return an error message, or None if the password is acceptable."""
    if len(password) < 8:
        return 'Password must be at least 8 characters'
    if not re.search(r'[A-Za-z]', password):
        return 'Password must contain at least one letter'
    if not re.search(r'\d', password):
        return 'Password must contain at least one number'
    return None


def university_from_email(email: str) -> str:
    domain = (email or '').split('@')[-1].lower()
    if domain == 'students.wits.ac.za':
        return 'wits'
    if domain == 'student.uj.ac.za':
        return 'uj'
    return 'other'
