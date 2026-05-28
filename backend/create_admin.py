from dotenv import load_dotenv
load_dotenv()

from app import create_app, db
from app.models import User

def create_admin_user():
    app = create_app()

    with app.app_context():
        db.create_all()

        admin_email = input("Enter admin email: ")
        admin_name = input("Enter admin name: ")
        admin_password = input("Enter admin password: ")
        role = input("Role — (1) Admin  (2) Super Admin [default 1]: ").strip() or '1'
        is_super = role == '2'

        existing = User.query.filter_by(email=admin_email).first()
        if existing:
            existing.is_admin = True
            if is_super:
                existing.is_super_admin = True
            db.session.commit()
            label = 'super admin' if is_super else 'admin'
            print(f"✓ Made {admin_email} a {label}")
        else:
            admin = User(
                email=admin_email,
                name=admin_name,
                university='admin',
                verified=True,
                is_admin=True,
                is_super_admin=is_super,
            )
            admin.set_password(admin_password)
            db.session.add(admin)
            db.session.commit()
            label = 'super admin' if is_super else 'admin'
            print(f"✓ Created {label}: {admin_email}")

if __name__ == '__main__':
    create_admin_user()
