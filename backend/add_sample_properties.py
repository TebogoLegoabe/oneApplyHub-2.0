from app import create_app, db
from app.models import Property, PropertyImage
import json

def add_sample_properties():
    app = create_app()
    
    with app.app_context():
        # Clear existing properties
        Property.query.delete()
        PropertyImage.query.delete()
        db.session.commit()
        print("Cleared existing properties")
        
        # Sample properties with realistic data
        properties_data = [
            {
                "name": "Thutong Student Accommodation",
                "address": "Braamfontein, Johannesburg",
                "property_type": "residence",
                "price_min": 4500,
                "price_max": 6500,
                "description": "Modern student accommodation in the heart of Braamfontein, walking distance to Wits campus. Features include 24/7 security, WiFi, and study areas.",
                "amenities": json.dumps(["WiFi", "24/7 Security", "Study Areas", "Laundry", "Common Room"]),
                "contact_info": "011-123-4567 | thutong@apex.co.za",
                "university": "wits",
                "approved": True
            },
            {
                "name": "Apex Student Accommodation",
                "address": "Braamfontein, Johannesburg",
                "property_type": "residence",
                "price_min": 4500,
                "price_max": 7200,
                "description": "Modern student accommodation in the heart of Braamfontein, walking distance to Wits campus. Features include 24/7 security, WiFi, and study areas.",
                "amenities": json.dumps(["WiFi", "24/7 Security", "Study Areas", "Laundry", "Gym", "Common Room"]),
                "contact_info": "011-123-4567 | info@apex.co.za",
                "university": "wits",
                "approved": True
            },
            {
                "name": "Crescent Studio",
                "address": "Hillbrow, Johannesburg", 
                "property_type": "apartment",
                "price_min": 3800,
                "price_max": 5500,
                "description": "Stylish studio apartments perfect for students. Close to Wits campus with excellent transport links.",
                "amenities": json.dumps(["WiFi", "Security", "Kitchen", "Study Desk", "Transport"]),
                "contact_info": "011-234-5678 | hello@crescentstudio.co.za",
                "university": "wits",
                "approved": True
            },
            {
                "name": "Rise Student Accommodation",
                "address": "Braamfontein, Johannesburg",
                "property_type": "residence", 
                "price_min": 5200,
                "price_max": 8500,
                "description": "Premium student living with modern facilities. State-of-the-art gym, rooftop terrace, and 24/7 support.",
                "amenities": json.dumps(["WiFi", "Gym", "24/7 Security", "Rooftop Terrace", "Study Lounges", "Laundry"]),
                "contact_info": "011-345-6789 | info@rise.co.za",
                "university": "wits",
                "approved": True
            },
            {
                "name": "South Point - Mvelelo",
                "address": "Mvelelo Building, Doornfontein, Johannesburg",
                "property_type": "apartment",
                "price_min": 3200,
                "price_max": 5800,
                "description": "Part of the South Point student accommodation network. Affordable living with good security and amenities.",
                "amenities": json.dumps(["WiFi", "Security", "Study Room", "Kitchen", "Laundry"]),
                "contact_info": "011-456-7890 | mvelelo@southpoint.co.za",
                "university": "wits",
                "approved": True
            },
            {
                "name": "South Point - 56 Jorissen",
                "address": "56 Jorissen Street, Braamfontein, Johannesburg",
                "property_type": "apartment",
                "price_min": 3500,
                "price_max": 6200,
                "description": "Prime location on Jorissen Street. Walking distance to Wits with excellent student facilities.",
                "amenities": json.dumps(["WiFi", "24/7 Security", "Study Areas", "Kitchen", "Parking"]),
                "contact_info": "011-567-8901 | jorissen@southpoint.co.za", 
                "university": "wits",
                "approved": True
            },
            {
                "name": "South Point - Melridge",
                "address": "Melridge Building, Johannesburg",
                "property_type": "apartment",
                "price_min": 3000,
                "price_max": 5200,
                "description": "Budget-friendly student accommodation with essential amenities. Great value for money.",
                "amenities": json.dumps(["WiFi", "Security", "Kitchen", "Study Room"]),
                "contact_info": "011-678-9012 | melridge@southpoint.co.za",
                "university": "wits", 
                "approved": True
            },
            {
                "name": "Campus Africa - 49 Jorissen",
                "address": "49 Jorissen Street, Braamfontein, Johannesburg",
                "property_type": "residence",
                "price_min": 4200,
                "price_max": 7500,
                "description": "Campus Africa's flagship building. Modern facilities with a focus on academic success.",
                "amenities": json.dumps(["WiFi", "24/7 Security", "Study Centers", "Tutoring", "Gym", "Dining Hall"]),
                "contact_info": "011-789-0123 | jorissen49@campusafrica.co.za",
                "university": "wits",
                "approved": True
            },
            {
                "name": "Campus Africa - 80 Jorissen", 
                "address": "80 Jorissen Street, Braamfontein, Johannesburg",
                "property_type": "residence",
                "price_min": 4000,
                "price_max": 7200,
                "description": "Part of Campus Africa's premium student accommodation network with excellent support services.",
                "amenities": json.dumps(["WiFi", "Security", "Study Areas", "Academic Support", "Gym"]),
                "contact_info": "011-890-1234 | jorissen80@campusafrica.co.za",
                "university": "wits",
                "approved": True
            },
            {
                "name": "Campus Africa - Rennie House",
                "address": "Rennie House, Braamfontein, Johannesburg", 
                "property_type": "residence",
                "price_min": 4500,
                "price_max": 8000,
                "description": "Historic building renovated for modern student living. Combines character with contemporary amenities.",
                "amenities": json.dumps(["WiFi", "24/7 Security", "Study Lounges", "Heritage Building", "Gym"]),
                "contact_info": "011-901-2345 | rennie@campusafrica.co.za",
                "university": "wits",
                "approved": True
            },
            {
                "name": "Wits Men's Residence",
                "address": "Wits University Campus, Braamfontein, Johannesburg",
                "property_type": "residence", 
                "price_min": 2800,
                "price_max": 4200,
                "description": "Official Wits University residence for male students. Traditional residence experience with modern updates.",
                "amenities": json.dumps(["WiFi", "Dining Hall", "Study Rooms", "Sports Facilities", "On-Campus"]),
                "contact_info": "011-717-1000 | residences@wits.ac.za",
                "university": "wits",
                "approved": True
            },
            {
                "name": "Barnato Hall",
                "address": "Wits University Campus, Braamfontein, Johannesburg",
                "property_type": "residence",
                "price_min": 3200,
                "price_max": 4800,
                "description": "Premier Wits residence known for academic excellence. Mixed residence with strong community spirit.",
                "amenities": json.dumps(["WiFi", "Dining Hall", "Study Centers", "Sports Fields", "Academic Support"]),
                "contact_info": "011-717-1050 | barnato@wits.ac.za",
                "university": "wits",
                "approved": True
            }
        ]
        
        # Add some UJ properties too
        uj_properties = [
            {
                "name": "UJ Auckland Park Residence",
                "address": "Auckland Park, Johannesburg",
                "property_type": "residence",
                "price_min": 2500,
                "price_max": 4000,
                "description": "Official UJ residence in Auckland Park. Safe, affordable accommodation with university support.",
                "amenities": json.dumps(["WiFi", "Dining Hall", "Study Rooms", "Security", "On-Campus"]),
                "contact_info": "011-559-1234 | residences@uj.ac.za",
                "university": "uj",
                "approved": True
            },
            {
                "name": "The Village UJ",
                "address": "Near UJ Auckland Park Campus, Johannesburg",
                "property_type": "apartment",
                "price_min": 3200,
                "price_max": 5500,
                "description": "Private student accommodation close to UJ. Modern apartments with shuttle service to campus.",
                "amenities": json.dumps(["WiFi", "Shuttle Service", "Security", "Gym", "Study Areas"]),
                "contact_info": "011-678-2345 | info@villageuj.co.za",
                "university": "uj",
                "approved": True
            }
        ]
        
        all_properties = properties_data + uj_properties
        
        # Add properties to database
        for prop_data in all_properties:
            property = Property(**prop_data)
            db.session.add(property)
        
        db.session.commit()
        print(f"✅ Added {len(all_properties)} properties to database!")
        
        # Verify properties were added
        count = Property.query.count()
        print(f"Total properties in database: {count}")
        
        # Show sample of added properties
        sample_props = Property.query.limit(3).all()
        for prop in sample_props:
            print(f"- {prop.name}: R{prop.price_min}-{prop.price_max}")

if __name__ == '__main__':
    add_sample_properties()