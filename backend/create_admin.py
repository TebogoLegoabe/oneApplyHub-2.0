"""Create or promote an admin user for oneApplyHub.

Usage:
    cd backend
    python create_admin.py

Notes:
    - Passwords are securely hashed through the User model.
    - The official super admin account is info@oneapplyhub.co.za.
    - Existing users can be promoted without changing their password.
"""

from getpass import getpass
import re
import sys

from dotenv import load_dotenv

load_dotenv()

from app import create_app, db  # noqa: E402
from app.models import User  # noqa: E402

SUPER_ADMIN_EMAIL = 'info@oneapplyhub.co.za'


def prompt(message, default=None, required=True):
    suffix = f' [{default}]' if default else ''
    while True:
        value = input(f'{message}{suffix}: ').strip()
        if not value and default is not None:
            return default
        if value or not required:
            return value
        print('This field is required.')


def prompt_email(default=SUPER_ADMIN_EMAIL):
    pattern = r'^[^@\s]+@[^@\s]+\.[^@\s]+$'
    while True:
        email = prompt('Admin email', default=default).lower()
        if re.match(pattern, email):
            return email
        print('Please enter a valid email address.')


def prompt_password(existing_user=False):
    if existing_user:
        change = prompt('Change password for this existing user? yes/no', default='no').lower()
        if change not in {'y', 'yes'}:
            return None

    while True:
        password = getpass('Admin password: ')
        confirm = getpass('Confirm password: ')
        if password != confirm:
            print('Passwords do not match.')
            continue
        if len(password) < 8:
            print('Password must be at least 8 characters.')
            continue
        if not re.search(r'[A-Za-z]', password) or not re.search(r'\d', password):
            print('Password must contain at least one letter and one number.')
            continue
        return password


def prompt_role(email):
    if email == SUPER_ADMIN_EMAIL:
        print('Official super admin email detected. Role will be Super Admin.')
        return True
    role = prompt('Role: (1) Managing Admin  (2) Super Admin', default='1')
    return role == '2'


def confirm_action(email, is_super_admin, existing_user):
    label = 'Super Admin' if is_super_admin else 'Managing Admin'
    action = 'Update existing user' if existing_user else 'Create new user'
    print('\nReview')
    print('------')
    print(f'Action : {action}')
    print(f'Email  : {email}')
    print(f'Role   : {label}')
    response = prompt('Continue? yes/no', default='yes').lower()
    return response in {'y', 'yes'}


def create_or_update_admin():
    app = create_app()

    with app.app_context():
        db.create_all()

        email = prompt_email()
        existing = User.query.filter_by(email=email).first()
        name = existing.name if existing else prompt('Admin name', default='oneApplyHub Admin' if email == SUPER_ADMIN_EMAIL else None)
        is_super_admin = prompt_role(email)

        if not confirm_action(email, is_super_admin, existing is not None):
            print('Cancelled. No changes made.')
            return 0

        password = prompt_password(existing_user=existing is not None)

        try:
            if existing:
                existing.name = name or existing.name
                existing.verified = True
                existing.is_admin = True
                existing.is_super_admin = bool(existing.is_super_admin or is_super_admin or email == SUPER_ADMIN_EMAIL)
                if password:
                    existing.set_password(password)
                user = existing
            else:
                user = User(
                    email=email,
                    name=name,
                    university='admin',
                    year_of_study='Admin',
                    faculty='Platform Management' if is_super_admin else 'Property Management',
                    verified=True,
                    is_admin=True,
                    is_super_admin=is_super_admin or email == SUPER_ADMIN_EMAIL,
                )
                user.set_password(password)
                db.session.add(user)

            db.session.commit()
        except Exception as exc:
            db.session.rollback()
            print(f'Failed to save admin user: {exc}')
            return 1

        label = 'Super Admin' if user.is_super_admin else 'Managing Admin'
        print('\nDone')
        print('----')
        print(f'Email : {user.email}')
        print(f'Role  : {label}')
        print('Status: verified and active')
        return 0


if __name__ == '__main__':
    sys.exit(create_or_update_admin())
