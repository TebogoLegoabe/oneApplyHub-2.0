from app import create_app, db
from app.models import User, Property, Review

def create_database():
    app = create_app()
    
    with app.app_context():
        # Drop all tables first (clean slate)
        db.drop_all()
        print("Dropped all existing tables")
        
        # Create all tables
        db.create_all()
        print("Created all tables")
        
        # Verify tables were created
        from sqlalchemy import inspect
        inspector = inspect(db.engine)
        tables = inspector.get_table_names()
        print(f"Tables created: {tables}")
        
        # Create a test user to verify everything works
        test_user = User(
            name="Test User",
            email="test@students.wits.ac.za",
            university="wits",
            year_of_study="2nd Year",
            faculty="Engineering"
        )
        test_user.set_password("test123")
        
        db.session.add(test_user)
        db.session.commit()
        print("Test user created successfully!")
        
        print(f"Database file created at: studentstay.db")

if __name__ == '__main__':
    create_database()