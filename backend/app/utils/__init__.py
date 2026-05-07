import re
from datetime import datetime, timezone


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def is_valid_university_email(email: str) -> bool:
    """Accept only Wits/UJ student email addresses."""
    valid_domains = ('students.wits.ac.za', 'student.uj.ac.za')
    if '@' not in email:
        return False
    local, domain = email.split('@', 1)
    return domain in valid_domains and bool(re.match(r'^\d{6,10}$', local))


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
    return 'wits' if 'wits' in email else 'uj'
