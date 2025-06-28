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
                "name": "Campus Africa- Park Mews",
                "address": "1 Princess Place, Parktown, Johannesburg",
                "property_type": "residence",
                "price_min": 5000,
                "price_max": 9200,
                "description": " ",
                "amenities": json.dumps(["WiFi", "24/7 Security", "Study Areas", "Laundry", "Common Room"]),
                "contact_info": "010-109-1700/071-999-1246 | info@campusafrica.co.za",
                "university": "wits",
                "approved": True
            },
            {
                "name": "Campus Central ",
                "address": "19 Girton Road, Parktown, Johannesburg",
                "property_type": "residence",
                "price_min": 5200,
                "price_max": 9200,
                "description": " ",
                "amenities": json.dumps(["WiFi", "24/7 Security", "Study Areas", "Laundry", "Common Room"]),
                "contact_info": "064-850-8486 | apply@campuscentral.co.za",
                "university": "wits",
                "approved": True
            },
            {
                "name": "St Davids Place ",
                "address": "5 St Davids Place, Parktown, Johannesburg",
                "property_type": "residence",
                "price_min": 5200,
                "price_max": 8200,
                "description": " ",
                "amenities": json.dumps(["WiFi", "24/7 Security", "Study Areas", "Laundry", "Common Room"]),
                "contact_info": "071-344-9670/064-850-8486 | info@stdavidsplace.co.za",
                "university": "wits",
                "approved": True
            },
            {
                "name": "The Albany ",
                "address": "Albany Road, Parktown, Johannesburg",
                "property_type": "residence",
                "price_min": 5200,
                "price_max": 5200,
                "description": " ",
                "amenities": json.dumps(["WiFi", "24/7 Security", "Study Areas", "Laundry", "Common Room"]),
                "contact_info": "072-281-4499 | info@gatewayres.co.za",
                "university": "wits",
                "approved": True
            },
            {
                "name": "Thrive Living- Arteria",
                "address": "33 Princess of Wales Terrance, Parktown, Johannesburg",
                "property_type": "residence",
                "price_min": 4640,
                "price_max": 9900,
                "description": " ",
                "amenities": json.dumps(["WiFi", "24/7 Security", "Study Areas", "Laundry", "Common Room"]),
                "contact_info": " | hello@thrivestudentliving.co.za",
                "university": "wits",
                "approved": True
            },
            {
                "name": "Yale Village ",
                "address": "65 Empire Road, Parktown, Johannesburg",
                "property_type": "residence",
                "price_min": 5250,
                "price_max": 9970,
                "description": " ",
                "amenities": json.dumps(["WiFi", "24/7 Security", "Study Areas", "Laundry", "Common Room"]),
                "contact_info": "010-200-3000 | info@respublica.co.za",
                "university": "wits",
                "approved": True
            },
            {
                "name": "CJ Students ",
                "address": "123 Empire Road, Parktown, Johannesburg",
                "property_type": "residence",
                "price_min": 5000,
                "price_max": 8500,
                "description": " ",
                "amenities": json.dumps(["WiFi", "24/7 Security", "Study Areas", "Laundry", "Common Room"]),
                "contact_info": "010-822-2828 | info@cjliving.co.za.co.za",
                "university": "wits",
                "approved": True
            },
             {
                "name": "Thrive Living- Apex Student ",
                "address": "12 Jorissen St, Braamfontein, Johannesburg",
                "property_type": "residence",
                "price_min": 4730,
                "price_max": 7700,
                "description": "Modern student accommodation in the heart of Braamfontein, walking distance to Wits campus.",
                "amenities": json.dumps(["WiFi", "24/7 Security", "Study Areas", "Laundry", "Gym", "Common Room"]),
                "contact_info": " | hello@thrivestudentliving.co.za",
                "university": "wits",
                "approved": True 
            },
            {
                "name": "Thrive Living- Crescent ",
                "address": "17 Eendracht St, Braamfontein, Johannesburg",
                "property_type": "residence",
                "price_min": 6350,
                "price_max": 8000,
                "description": "Modern student accommodation in the heart of Braamfontein, walking distance to Wits campus.",
                "amenities": json.dumps(["WiFi", "24/7 Security", "Study Areas", "Laundry", "Gym", "Common Room"]),
                "contact_info": " | hello@thrivestudentliving.co.za",
                "university": "wits",
                "approved": True 
            },
             {
                "name": "Thrive Living- Horizon Heights",
                "address": "39 Twickenham Avenue, Auckland Park, Johannesburg",
                "property_type": "residence",
                "price_min": 5600,
                "price_max": 6150,
                "description": " ",
                "amenities": json.dumps(["WiFi", "24/7 Security", "Study Areas", "Laundry", "Gym", "Common Room"]),
                "contact_info": " | hello@thrivestudentliving.co.za",
                "university": "uj & wits",
                "approved": True 
            },
             {
                "name": "Thrive Living- Kingsway Place",
                "address": " 66 Kingsway Avenue, Auckland Park, Johannesburg",
                "property_type": "residence",
                "price_min": 5600,
                "price_max": 6150,
                "description": " ",
                "amenities": json.dumps(["WiFi", "24/7 Security", "Study Areas", "Laundry", "Gym", "Common Room"]),
                "contact_info": " | hello@thrivestudentliving.co.za",
                "university": "uj & wits",
                "approved": True 
            },
            {
                "name": "Thrive Living- Richmond Central ",
                "address": "42 Richmond Avenue, Auckland Park, Johannesburg",
                "property_type": "residence",
                "price_min": 4870,
                "price_max": 6150,
                "description": " ",
                "amenities": json.dumps(["WiFi", "24/7 Security", "Study Areas", "Laundry", "Gym", "Common Room"]),
                "contact_info": " | hello@thrivestudentliving.co.za",
                "university": "uj & wits",
                "approved": True 
            },
            {
                "name": "Thrive Living- Richmond Corner ",
                "address": "52 Richmond Avenue, Auckland Park, Johannesburg",
                "property_type": "residence",
                "price_min": 5450,
                "price_max": 6800,
                "description": " ",
                "amenities": json.dumps(["WiFi", "24/7 Security", "Study Areas", "Laundry", "Gym", "Common Room"]),
                "contact_info": " | hello@thrivestudentliving.co.za",
                "university": "uj & wits",
                "approved": True 
            },
            {
                "name": "South Point - Mvelelo ",
                "address": "19 Melle Street, Braamfontein, Johannesburg",
                "property_type": "apartment",
                "price_min": 5380,
                "price_max": 5870,
                "description": "Affordable living with good security and amenities.",
                "amenities": json.dumps(["WiFi", "Security", "Study Room", "Kitchen", "Laundry"]),
                "contact_info": "076-011-5702 | info@southpoint.co.za",
                "university": "uj",
                "approved": True
            },
            {
                "name": "South Point - 56 Jorissen ",
                "address": "56 Jorissen Street, Braamfontein, Johannesburg",
                "property_type": "apartment",
                "price_min": 5150,
                "price_max": 7375,
                "description": "Prime location on Jorissen Street. Walking distance to Wits with excellent student facilities.",
                "amenities": json.dumps(["WiFi", "24/7 Security", "Study Areas", "Kitchen", "Parking"]),
                "contact_info": "060-017-8099 | admin@56jorissen.co.za", 
                "university": "wits",
                "approved": True
            },
            {
                "name": "South Point - Epozini House",
                "address": "46 De Korte, Braamfontein, Johannesburg",
                "property_type": "apartment",
                "price_min": 5430,
                "price_max": 6310,
                "description": " ",
                "amenities": json.dumps(["WiFi", "24/7 Security", "Study Areas", "Kitchen", "Parking"]),
                "contact_info": "011-489-1900 | info@southpoint.co.za", 
                "university": "wits",
                "approved": True
            },
            {
                "name": "South Point - Geldenhuys House",
                "address": "33 Jorissen Street,Wanderers View Estate, Braamfontein, Johannesburg",
                "property_type": "apartment",
                "price_min": 5380,
                "price_max": 5870,
                "description": " ",
                "amenities": json.dumps(["WiFi", "24/7 Security", "Study Areas", "Kitchen", "Parking"]),
                "contact_info": "011-489-1900 | info@southpoint.co.za", 
                "university": "wits",
                "approved": True
            },
            {
                "name": "South Point - Diamond House",
                "address": "33 Melle Street, Braamfontein, Johannesburg",
                "property_type": "apartment",
                "price_min": 5380,
                "price_max": 5870,
                "description": "Budget-friendly student accommodation with essential amenities. Great value for money.",
                "amenities": json.dumps(["WiFi", "Security", "Kitchen", "Study Room"]),
                "contact_info":  "011-489-1900 | info@southpoint.co.za",
                "university": "wits", 
                "approved": True
            },
            {
                "name": "South Point - Melridge House",
                "address": "Melridge Building, Stiemens Street, Braamfontein, Johannesburg",
                "property_type": "apartment",
                "price_min": 4930,
                "price_max": 5870,
                "description": "Budget-friendly student accommodation with essential amenities. Great value for money.",
                "amenities": json.dumps(["WiFi", "Security", "Kitchen", "Study Room"]),
                "contact_info":  "076-011-5702 | info@southpoint.co.za",
                "university": "wits", 
                "approved": True
            },
            {
                "name": "South Point -Norvic House",
                "address": "91 De Korte Street, Braamfontein, Johannesburg",
                "property_type": "apartment",
                "price_min": 5380,
                "price_max": 5870,
                "description": "Budget-friendly student accommodation with essential amenities. Great value for money.",
                "amenities": json.dumps(["WiFi", "Security", "Kitchen", "Study Room"]),
                "contact_info":  "076-011-5702 | info@southpoint.co.za",
                "university": "wits", 
                "approved": True
            },
            {
                "name": "South Point - Blackburn",
                "address": "77 Juta Street, Braamfontein, Johannesburg",
                "property_type": "apartment",
                "price_min": 5380,
                "price_max": 5870,
                "description": "Budget-friendly student accommodation with essential amenities. Great value for money.",
                "amenities": json.dumps(["WiFi", "Security", "Kitchen", "Study Room"]),
                "contact_info":  "011-489-1900 | info@southpoint.co.za",
                "university": "wits", 
                "approved": True
            },
           {
                "name": "South Point - Van Der Stel Place",
                "address": "20 Melle Street, Braamfontein, Johannesburg",
                "property_type": "apartment",
                "price_min": 5320,
                "price_max": 5870,
                "description": "Budget-friendly student accommodation with essential amenities. Great value for money.",
                "amenities": json.dumps(["WiFi", "Security", "Kitchen", "Study Room"]),
                "contact_info":  "076-011-5702 | info@southpoint.co.za",
                "university": "wits", 
                "approved": True
            },
            {
                "name": "South Point- Argon House",
                "address": "89 Juta Street, Braamfontein, Johannesburg",
                "property_type": "apartment",
                "price_min": 4930,
                "price_max": 5870,
                "description": "Budget-friendly student accommodation with essential amenities. Great value for money.",
                "amenities": json.dumps(["WiFi", "Security", "Kitchen", "Study Room"]),
                "contact_info":  "076-011-5702| info@southpoint.co.za",
                "university": "wits", 
                "approved": True
            },  
            {
                "name": "South Point- K.S.I House",
                "address": "11 Biccard Street, Braamfontein, Johannesburg",
                "property_type": "apartment",
                "price_min": 5320,
                "price_max": 5870,
                "description": "Budget-friendly student accommodation with essential amenities. Great value for money.",
                "amenities": json.dumps(["WiFi", "Security", "Kitchen", "Study Room"]),
                "contact_info":  "060-018-9901| info@southpoint.co.za",
                "university": "wits", 
                "approved": True
            },  
            {
                "name": "South Point- Clifton Heights",
                "address": "Cnr De Korte  Biccard Street, Braamfontein, Johannesburg",
                "property_type": "apartment",
                "price_min": 5260,
                "price_max": 5540,
                "description": "Budget-friendly student accommodation with essential amenities. Great value for money.",
                "amenities": json.dumps(["WiFi", "Security", "Kitchen", "Study Room"]),
                "contact_info":  "011-489-1900| info@southpoint.co.za",
                "university": "wits", 
                "approved": True
            },  
                        {
                "name": "South Point- B-Hive",
                "address": "43 Biccard Street, Braamfontein, Johannesburg",
                "property_type": "apartment",
                "price_min": 5380,
                "price_max": 5870,
                "description": "Budget-friendly student accommodation with essential amenities. Great value for money.",
                "amenities": json.dumps(["WiFi", "Security", "Kitchen", "Study Room"]),
                "contact_info":  "076-011-5702| info@southpoint.co.za",
                "university": "wits", 
                "approved": True
            },  
            {
                "name": "South Point- Phumelela House",
                "address": "99 Simmons Street, Braamfontein, Johannesburg",
                "property_type": "apartment",
                "price_min": 5320,
                "price_max": 5870,
                "description": "Budget-friendly student accommodation with essential amenities. Great value for money.",
                "amenities": json.dumps(["WiFi", "Security", "Kitchen", "Study Room"]),
                "contact_info":  "011-489-1918| info@southpoint.co.za",
                "university": "wits", 
                "approved": True
            },  
            {
                "name": "South Point- Argon House",
                "address": "89 Juta Street, Braamfontein, Johannesburg",
                "property_type": "apartment",
                "price_min": 4930,
                "price_max": 5870,
                "description": "Budget-friendly student accommodation with essential amenities. Great value for money.",
                "amenities": json.dumps(["WiFi", "Security", "Kitchen", "Study Room"]),
                "contact_info":  "076-011-5702| info@southpoint.co.za",
                "university": "wits & uj", 
                "approved": True
            },              {
                "name": "South Point- 90 De Korte",
                "address": " 90 De Korte Street, Braamfontein, Johannesburg",
                "property_type": "apartment",
                "price_min": 5540,
                "price_max": 6040,
                "description": "Budget-friendly student accommodation with essential amenities. Great value for money.",
                "amenities": json.dumps(["WiFi", "Security", "Kitchen", "Study Room"]),
                "contact_info":  "011-489-1900| info@southpoint.co.za",
                "university": "wits & uj", 
                "approved": True
            },  
            {
                "name": "Campus Africa - 80 Jorissen", 
                "address": "80 Jorissen Street, Braamfontein, Johannesburg",
                "property_type": "residence",
                "price_min": 5500,
                "price_max": 7500,
                "description": "Part of Campus Africa's premium student accommodation network with excellent support services.",
                "amenities": json.dumps(["WiFi", "Security", "Study Areas", "Gym"]),
                "contact_info": "010-109-1700/071-999-1246 | info@campusafrica.co.za",
                "university": "wits & uj",
                "approved": True
            },
            {
                "name": "Campus Africa - Amani House", 
                "address": "40 Jorissen Street, Braamfontein, Johannesburg",
                "property_type": "residence",
                "price_min": 5500,
                "price_max": 7500,
                "description": " ",
                "amenities": json.dumps(["WiFi", "Security", "Study Areas","Entertainment Area","Laundry", "Gym"]),
                "contact_info": "010-109-1700/071-999-1246 | info@campusafrica.co.za",
                "university": "wits & uj",
                "approved": True
            },
            {
                "name": "Campus Africa - Rennie House", 
                "address": "19 Ameshoff Street, Braamfontein, Johannesburg",
                "property_type": "residence",
                "price_min": 5500,
                "price_max": 6600,
                "description": " ",
                "amenities": json.dumps(["WiFi", "Security", "Study Areas", "Gym"]),
                "contact_info": "010-109-1700/071-999-1246 | info@campusafrica.co.za",
                "university": "wits",
                "approved": True
            },
            {
                "name": "Campus Africa - Braamlofts", 
                "address": "24 Biccard Street, Braamfontein, Johannesburg",
                "property_type": "residence",
                "price_min": 5500,
                "price_max": 5950,
                "description": " ",
                "amenities": json.dumps(["WiFi", "Security", "Study Areas", "Gym"]),
                "contact_info": "010-109-1700/071-999-1246 | info@campusafrica.co.za",
                "university": "wits & uj",
                "approved": True
            },
            {
                "name": "Campus Africa - YMCA", 
                "address": "104 Rissik Street, Braamfontein, Johannesburg",
                "property_type": "residence",
                "price_min": 4300,
                "price_max": 6400,
                "description": "Part of Campus Africa's premium student accommodation network with excellent support services.",
                "amenities": json.dumps(["WiFi", "Security", "Study Areas", "Gym"]),
                "contact_info": "010-109-1700/071-999-1246 | info@campusafrica.co.za",
                "university": "wits",
                "approved": True
            },
            {
                "name": "Campus Africa - Wynton Joy", 
                "address": "3 Nugget Street, Hillbrow, Johannesburg",
                "property_type": "residence",
                "price_min": 5500,
                "price_max": 5500,
                "description": "Part of Campus Africa's premium student accommodation network with excellent support services.",
                "amenities": json.dumps(["WiFi", "Security", "Study Areas", "Gym"]),
                "contact_info": "010-109-1700/071-999-1246 | info@campusafrica.co.za",
                "university": "wits & uj & cjc",
                "approved": True
            },
        

        ]
        
        # Add some UJ properties too
        uj_properties = [
             {
                "name": "South Point - Relytant",
                "address": "136 Sivewright, New Doornfontein, Johannesburg",
                "property_type": "apartment",
                "price_min": 5260,
                "price_max": 5540,
                "description": "Budget-friendly student accommodation with essential amenities. Great value for money.",
                "amenities": json.dumps(["WiFi", "Security", "Kitchen", "Study Room"]),
                "contact_info":  "061-938-7611 | info@southpoint.co.za",
                "university": "uj", 
                "approved": True
            },
            {
                "name": "Campus Africa - Dunvista Mansions", 
                "address": "70 Banket Street, Hillbrow, Johannesburg",
                "property_type": "residence",
                "price_min": 5500,
                "price_max": 5500,
                "description": "Part of Campus Africa's premium student accommodation network with excellent support services.",
                "amenities": json.dumps(["WiFi", "Security", "Study Areas", "Gym"]),
                "contact_info": "010-109-1700/072-475-4652 | info@campusafrica.co.za",
                "university": "uj & cjc ",
                "approved": True
            },
         
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
