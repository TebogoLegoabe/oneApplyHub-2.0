# Create compare_database_paths.py
from app import create_app
import os

def compare_paths():
    print("=== Database Path Comparison ===")
    
    # Check what our scripts see
    app = create_app()
    with app.app_context():
        db_uri = app.config['SQLALCHEMY_DATABASE_URI']
        print(f"App database URI: {db_uri}")
        
        if 'sqlite:///' in db_uri:
            db_path = db_uri.replace('sqlite:///', '')
            print(f"Database file path: {db_path}")
            print(f"File exists: {os.path.exists(db_path)}")
            print(f"File size: {os.path.getsize(db_path) if os.path.exists(db_path) else 0} bytes")
            print(f"Working directory: {os.getcwd()}")
            
            # Check if it's absolute or relative path
            print(f"Is absolute path: {os.path.isabs(db_path)}")
            print(f"Absolute path: {os.path.abspath(db_path)}")

if __name__ == '__main__':
    compare_paths()