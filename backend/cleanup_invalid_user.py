# cleanup_invalid_user.py
from app import create_app, db
from app.models import User

def cleanup_invalid_user():
    app = create_app()
    
    with app.app_context():
        # Remove the invalid email account
        invalid_user = User.query.filter_by(email='oneApply@students.wits.ac.za').first()
        
        if invalid_user:
            print(f"Removing invalid user: {invalid_user.email}")
            db.session.delete(invalid_user)
            db.session.commit()
            print("✅ Invalid user removed")
        else:
            print("No invalid user found")

if __name__ == '__main__':
    cleanup_invalid_user()