from app import create_app, db
from app.models import User

def check_users():
    app = create_app()
    
    with app.app_context():
        users = User.query.all()
        print(f"Total users in database: {len(users)}")
        print("\nAll users:")
        for user in users:
            print(f"- Email: {user.email}")
            print(f"  Name: {user.name}")
            print(f"  University: {user.university}")
            print(f"  Verified: {user.verified}")
            print("---")

if __name__ == '__main__':
    check_users()