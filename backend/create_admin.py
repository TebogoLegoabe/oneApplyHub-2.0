from app import create_app, db
from app.models import User

def create_admin_user():
    app = create_app()
    
    with app.app_context():
        # Update database schema to include is_admin column
        db.create_all()
        
        admin_email = input("Enter admin email: ")
        admin_name = input("Enter admin name: ")
        admin_password = input("Enter admin password: ")
        
        # Check if admin already exists
        existing_admin = User.query.filter_by(email=admin_email).first()
        if existing_admin:
            existing_admin.is_admin = True
            db.session.commit()
            print(f"✅ Made {admin_email} an admin")
        else:
            # Create new admin user
            admin = User(
                email=admin_email,
                name=admin_name,
                university='admin',
                verified=True,
                is_admin=True
            )
            admin.set_password(admin_password)
            
            db.session.add(admin)
            db.session.commit()
            print(f"✅ Created admin user: {admin_email}")

if __name__ == '__main__':
    create_admin_user()