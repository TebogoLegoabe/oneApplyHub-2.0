from app import create_app, db
from app.models import Property

def debug_properties():
    app = create_app()
    
    with app.app_context():
        print("=== Property Debug Info ===")
        
        # Check all properties
        all_props = Property.query.all()
        print(f"Total properties in database: {len(all_props)}")
        
        # Check approved properties
        approved_props = Property.query.filter_by(approved=True).all()
        print(f"Approved properties: {len(approved_props)}")
        
        # Show approval status for each
        print("\nProperty approval status:")
        for prop in all_props:
            print(f"- {prop.name}: approved={prop.approved}")
        
        # Test the exact query used in the API
        print("\n=== Testing API Query ===")
        query = Property.query.filter_by(approved=True)
        api_results = query.all()
        print(f"API query results: {len(api_results)}")
        
        if len(api_results) > 0:
            print("First property from API query:")
            first_prop = api_results[0]
            print(f"- Name: {first_prop.name}")
            print(f"- Approved: {first_prop.approved}")
            print(f"- University: {first_prop.university}")

if __name__ == '__main__':
    debug_properties()