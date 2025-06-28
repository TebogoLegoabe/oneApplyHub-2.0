import os
import sys
from app import create_app, db
from app.models import User, Property, Review

def setup_database():
    print("=== StudentStay Database Setup ===")
    
    # Get the backend directory
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    print(f"Backend directory: {backend_dir}")
    
    # Create the app
    app = create_app()
    
    with app.app_context():
        # Show the database path
        db_uri = app.config['SQLALCHEMY_DATABASE_URI']
        print(f"Database URI: {db_uri}")
        
        # Extract the actual file path
        if 'sqlite:///' in db_uri:
            db_path = db_uri.replace('sqlite:///', '')
            print(f"Database file path: {db_path}")
            
            # Create directory if it doesn't exist
            db_dir = os.path.dirname(db_path)
            if db_dir and not os.path.exists(db_dir):
                os.makedirs(db_dir)
                print(f"Created directory: {db_dir}")
        
        try:
            # Drop existing tables
            print("Dropping existing tables...")
            db.drop_all()
            
            # Create all tables
            print("Creating tables...")
            db.create_all()
            
            # Verify tables
            from sqlalchemy import inspect
            inspector = inspect(db.engine)
            tables = inspector.get_table_names()
            print(f"Tables created: {tables}")
            
            # Create test user
            print("Creating test user...")
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
            print("✅ Test user created!")
            
            # Verify file was created
            if 'sqlite:///' in db_uri:
                db_path = db_uri.replace('sqlite:///', '')
                if os.path.exists(db_path):
                    file_size = os.path.getsize(db_path)
                    print(f"✅ Database file created successfully!")
                    print(f"   Location: {db_path}")
                    print(f"   Size: {file_size} bytes")
                else:
                    print(f"❌ Database file not found at: {db_path}")
            
            print("\n=== Database setup complete! ===")
            
        except Exception as e:
            print(f"❌ Error during database setup: {e}")
            sys.exit(1)

if __name__ == '__main__':
    setup_database()