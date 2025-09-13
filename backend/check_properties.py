from app import create_app, db
from app.models import Property

def check_properties():
    app = create_app()
    
    with app.app_context():
        # Count total properties
        total_count = Property.query.count()
        print(f"Total properties in database: {total_count}")
        
        if total_count > 0:
            print("\nProperties in database:")
            properties = Property.query.all()
            for prop in properties:
                print(f"- {prop.name} ({prop.university}) - R{prop.price_min}-{prop.price_max}")
        else:
            print("❌ No properties found in database!")
            print("Run 'python add_sample_properties.py' to add sample data")

if __name__ == '__main__':
    check_properties()