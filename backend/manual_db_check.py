# Create manual_db_check.py
import sqlite3
import os

def manual_check():
    db_path = r"C:\Users\User\OneDrive\Desktop\Flask\studentstay\backend\studentstay.db"
    
    print(f"Checking database: {db_path}")
    print(f"File exists: {os.path.exists(db_path)}")
    print(f"File size: {os.path.getsize(db_path)} bytes")
    
    try:
        # Connect directly with sqlite3
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        print(f"Tables: {[t[0] for t in tables]}")
        
        # Check property count
        cursor.execute("SELECT COUNT(*) FROM property")
        count = cursor.fetchone()[0]
        print(f"Properties in database: {count}")
        
        # Check first few properties
        cursor.execute("SELECT name, university, approved FROM property LIMIT 3")
        sample_props = cursor.fetchall()
        print("Sample properties:")
        for prop in sample_props:
            print(f"  - {prop[0]} ({prop[1]}) approved={prop[2]}")
        
        conn.close()
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    manual_check()