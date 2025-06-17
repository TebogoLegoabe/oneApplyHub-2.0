import os
from app import create_app

def find_database():
    print("Current working directory:", os.getcwd())
    
    app = create_app()
    
    # Check the database URI from config
    print("Database URI:", app.config['SQLALCHEMY_DATABASE_URI'])
    
    # Check for database file in various locations
    possible_locations = [
        'studentstay.db',
        './studentstay.db', 
        '../studentstay.db',
        os.path.join(os.getcwd(), 'studentstay.db'),
    ]
    
    for location in possible_locations:
        if os.path.exists(location):
            full_path = os.path.abspath(location)
            print(f"✅ Database found at: {full_path}")
            print(f"File size: {os.path.getsize(location)} bytes")
            return full_path
    
    print("❌ Database file not found in expected locations")
    
    # Search for any .db files
    print("\nSearching for .db files in current directory:")
    for file in os.listdir('.'):
        if file.endswith('.db'):
            print(f"Found .db file: {file}")
    
    return None

if __name__ == '__main__':
    find_database()