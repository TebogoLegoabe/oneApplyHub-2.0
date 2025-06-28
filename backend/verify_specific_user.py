from app import create_app, db
from app.models import User

def verify_user():
    app = create_app()
    
    with app.app_context():
        # Verify the student number account
        user = User.query.filter_by(email='2307157@students.wits.ac.za').first()
        
        if user:
            user.verified = True
            db.session.commit()
            print(f"✅ Verified user: {user.email}")
            print(f"✅ Name: {user.name}")
            print(f"✅ University: {user.university}")
            print(f"✅ Verified: {user.verified}")
        else:
            print("❌ User not found")

if __name__ == '__main__':
    verify_user()