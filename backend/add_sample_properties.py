from app import create_app, db
from app.models import Property, PropertyImage
import json

def add_sample_properties():
    app = create_app()
    
    with app.app_context():
        Property.query.delete()
        PropertyImage.query.delete()
        db.session.commit()
        print("Cleared existing properties")
        
        properties_data = [
            {
                "name": "Campus Africa- Park Mews",
                "address": "1 Princess Place, Parktown, Johannesburg",
                "property_type": "residence",
                "price_min": 5000,
                "price_max": 9200,
                "description": "Part of Campus Africa's premium student accommodation network with excellent support services.",
                "amenities": json.dumps(["WiFi", "24/7 Security", "Study Areas", "Laundry", "Common Room"]),
                "contact_info": "010-109-1700/071-999-1246 | info@campusafrica.co.za",
                "university": "wits",
                "approved": True
            },
            {
                "name": "Campus Central- Girton ",
                "address": "19 Girton Road, Parktown, Johannesburg",
                "property_type": "residence",
                "price_min": 5200,
                "price_max": 9200,
                "description": "Morden student living redefined, safe space for you to reach your potential. ",
                "amenities": json.dumps(["WiFi", "24/7 Security", "Study Areas", "Laundry", "Common Room"]),
                "contact_info": "064-850-8486 | apply@campuscentral.co.za",
                "university": "wits",
                "approved": True
            },
            {
                "name": "Campus Central- St Davids Place ",
                "address": "5 St Davids Place, Parktown, Johannesburg",
                "property_type": "residence",
                "price_min": 5200,
                "price_max": 8200,
                "description": " Morden student living redefined, safe space for you to reach your potential.",
                "amenities": json.dumps(["WiFi", "24/7 Security", "Study Areas", "Laundry", "Common Room"]),
                "contact_info": "071-344-9670/064-850-8486 | info@stdavidsplace.co.za",
                "university": "wits",
                "approved": True
            },
            {
                "name": "Campus Central- The Albany ",
                "address": "Albany Road, Parktown, Johannesburg",
                "property_type": "residence",
                "price_min": 5200,
                "price_max": 5200,
                "description": "Morden student living redefined, safe space for you to reach your potential.",
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
                "description": "Modern student accommodation in the heart of Braamfontein, walking distance to Wits campus.",
                "amenities": json.dumps(["WiFi", "24/7 Security", "Study Areas", "Laundry", "Common Room"]),
                "contact_info": "087-820-0640| hello@thrivestudentliving.co.za",
                "university": "wits",
                "approved": True
            },
            {
                "name": "Republisca-Yale Village ",
                "address": "65 Empire Road, Parktown, Johannesburg",
                "property_type": "residence",
                "price_min": 5250,
                "price_max": 9970,
                "description": "All inclusive student lifestyle across the road from the WITS main campus. ",
                "amenities": json.dumps(["WiFi", "24/7 Security", "Study Areas", "Laundry", "Common Room"]),
                "contact_info": "010-200-3000 | info@respublica.co.za",
                "university": "wits",
                "approved": True
            },
            {
                "name": "CJ Students-Mill Junction ",
                "address": "123 Empire Road, Parktown, Johannesburg",
                "property_type": "residence",
                "price_min": 5000,
                "price_max": 8500,
                "description": "Convinient energetic communal space where community comes togather  ",
                "amenities": json.dumps(["WiFi", "24/7 Security", "Study Areas", "Laundry", "Common Room"]),
                "contact_info": "010-822-2828 | info@cjliving.co.za.",
                "university": "wits",
                "approved": True
            },
            {   
                "name": "CJ Students- YW Junction", 
                "address": " 128 De Korte St, Braamfontein, Johannesburg",
                "property_type": "apartments",
                "price_min": 5000 ,                #price not specified,added sample value to run the code
                "price_max": 5500,
                "description": " Convinient energetic communal space where community comes togather ",
                "amenities": json.dumps(["WiFi", "24/7 Security","Study room","Gym","Recreational Area"]),
                "contact_info": "087-163-9625 | hello@cjstudents.co.za",
                "university": "wits",
                "approved": True
            },
            {   
                "name": " Student Digz- Argyle House ", 
                "address": " 4 Street Queens Rd, Parktown, Johannesburg",
                "property_type": "residence",
                "price_min": 4800 ,
                "price_max": 6300,
                "description": " ",
                "amenities": json.dumps([" 24/7 security","Wi-fi","Study Area","Transport","Gym","Entertainment Room" ,]),
                "contact_info": "071-047-5191| info@studentdigz.co.za",
                "university": "wits & uj",
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
                "contact_info": " 087-820-0640|| hello@thrivestudentliving.co.za",
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
                "contact_info": "087-820-0640| | hello@thrivestudentliving.co.za",
                "university": "wits",
                "approved": True 
            },
            {
                "name": "Thrive Living- Horizon Heights",
                "address": "39 Twickenham Avenue, Auckland Park, Johannesburg",
                "property_type": "residence",
                "price_min": 5600,
                "price_max": 6150,
                "description": "Modern student accommodation in the heart of Braamfontein, walking distance to Wits campus ",
                "amenities": json.dumps(["WiFi", "24/7 Security", "Study Areas", "Laundry", "Gym", "Common Room"]),
                "contact_info": " 087-820-0640|| hello@thrivestudentliving.co.za",
                "university": "uj & wits",
                "approved": True 
            },
            {
                "name": "Thrive Living- Kingsway Place",
                "address": " 66 Kingsway Avenue, Auckland Park, Johannesburg",
                "property_type": "residence",
                "price_min": 5600,
                "price_max": 6150,
                "description": "Modern student accommodation in the heart of Braamfontein, walking distance to Wits campus ",
                "amenities": json.dumps(["WiFi", "24/7 Security", "Study Areas", "Laundry", "Gym", "Common Room"]),
                "contact_info": "087-820-0640| | hello@thrivestudentliving.co.za",
                "university": "uj & wits",
                "approved": True 
            },
            {
                "name": "Thrive Living- Richmond Central ",
                "address": "42 Richmond Avenue, Auckland Park, Johannesburg",
                "property_type": "residence",
                "price_min": 4870,
                "price_max": 6150,
                "description": "Modern student accommodation in the heart of Braamfontein, walking distance to Wits campus",
                "amenities": json.dumps(["WiFi", "24/7 Security", "Study Areas", "Laundry", "Gym", "Common Room"]),
                "contact_info": "087-820-0640| | hello@thrivestudentliving.co.za",
                "university": "uj & wits",
                "approved": True 
            },
            {
                "name": "Thrive Living- Richmond Corner ",
                "address": "52 Richmond Avenue, Auckland Park, Johannesburg",
                "property_type": "residence",
                "price_min": 5450,
                "price_max": 6800,
                "description": "Modern student accommodation in the heart of Braamfontein, walking distance to Wits campus",
                "amenities": json.dumps(["WiFi", "24/7 Security", "Study Areas", "Laundry", "Gym", "Common Room"]),
                "contact_info": "087-820-0640| | hello@thrivestudentliving.co.za",
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
                "description": "Budget-friendly student accommodation with essential amenities ",
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
                "description": "Budget-friendly student accommodation with essential amenities ",
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
                "description": "Budget-friendly student accommodation with essential amenities.",
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
                "description": "Budget-friendly student accommodation with essential amenities.",
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
                "description": "Budget-friendly student accommodation with essential amenities.",
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
                "description": "Budget-friendly student accommodation with essential amenities.",
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
                "description": "Budget-friendly student accommodation with essential amenities.",
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
                "description": "Budget-friendly student accommodation with essential amenities.",
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
                "description": "Budget-friendly student accommodation with essential amenities.",
                "amenities": json.dumps(["WiFi", "Security", "Kitchen", "Study Room"]),
                "contact_info":  "060-018-9901| info@southpoint.co.za",
                "university": "wits", 
                "approved": True
            },  
            {
                "name": "South Point- Clifton Heights",
                "address": "92 De Korte  Biccard Street, Braamfontein, Johannesburg",
                "property_type": "apartment",
                "price_min": 5260,
                "price_max": 5540,
                "description": "Budget-friendly student accommodation with essential amenities.",
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
                "description": "Budget-friendly student accommodation with essential amenities.",
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
                "description": "Budget-friendly student accommodation with essential amenities.",
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
                "description": "Budget-friendly student accommodation with essential amenities.",
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
                "description": "Budget-friendly student accommodation with essential amenities.",
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
                "description": "Part of Campus Africa's premium student accommodation network with excellent support services. ",
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
                "description": "Part of Campus Africa's premium student accommodation network with excellent support services. ",
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
                "description": "Part of Campus Africa's premium student accommodation network with excellent support services. ",
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
            {
                "name": "Units of Jorissen - Rise", 
                "address": "42 Jorissen Street, Braamfontein, Johannesburg",
                "property_type": "residence",
                "price_min": 5500,
                "price_max": 6500,
                "description": " A few steps away from the University of the Witwatersrand, a thriving community where you experience the epitome of modern student living ",
                "amenities": json.dumps(["WiFi", "Security", "Laundry", "Study Area", "Gym",  "Entertainment Area",]),
                "contact_info": "010-010-9220 | uoj@risestudentliving.com",
                "university": "wits",
                "approved": True
            },
            {
                "name": "Braamfontein Gate", 
                "address": "209 Smit Street, Hillbrow, Johannesburg",
                "property_type": "apartments",
                "price_min": 2500,
                "price_max": 9500,
                "description": "The tallest building in Braamfontein across the road from the Gautrain Station with a variety of unit types to choose from",
                "amenities": json.dumps(["WiFi", "Security","Laundry", "Study Area", "Gym", "Sports Court", "Entertainment Area", "Swimming Pool", "Cinema","Garden"]),
                "contact_info": "071-674-9023/082-947-0976 | info@braamfonteingate.co.za",
                "university": "wits & uj ",
                "approved": True
            },
            {   
                "name": "Nota Bene", 
                "address": " 46 Juta St, Braamfontein, Johannesburg",
                "property_type": "apartments",
                "price_min": 5000 ,
                "price_max": 8550,
                "description": "Known for its state-of-the-art gym and sun deck, Nota Bene offers convenience as it is a walking distance to stores, city life and Wits main campus. ",
                "amenities": json.dumps([" 24/7 security","Swimming Pool", "Entertainment Area", "Wi-fi","Gym","Laundry","Wall Heater",]),
                "contact_info": "087-232-5511 | howzit@urbancircle.co.za",
                "university": "wits & uj",
                "approved": True
            },
            {   
                "name": "J-One ", 
                "address": " 1 Leyds Street, Biccard Street, Johannesburg",
                "property_type": "apartments",
                "price_min": 5000 ,
                "price_max": 8000,
                "description": " Exceptional student living in the vibrant heart of Braamfontein, J-One provides a home that fosters growth, learning and an unforgettable experience ",
                "amenities": json.dumps([" 24/7 security","Reliable Transport", "Sleepovers", "Wi-fi","Gym","Laundry",]),
                "contact_info": "011-403-1111 |stay@j-one.co.za",
                "university": "wits",
                "approved": True
            },
            {   
                "name": "Born Free-The Verge 1", 
                "address": " 42 De Korte, Braamfontein, Johannesburg",
                "property_type": "residence",
                "price_min": 3700 ,
                "price_max": 7700,
                "description": "At the door of the University of the Witwatersrand, Verge 1 offers you secure rooms",
                "amenities": json.dumps([" 24/7 security","Handyman On Site","Wi-fi","Gym","Laundry",]),
                "contact_info": "063-360-1558|info@bornfreerentals.co.za",
                "university": "wits",
                "approved": True
            },
            {   
                "name": "Born Free-The Verge 2", 
                "address": " 22 Jorissen, Braamfontein, Johannesburg",
                "property_type": "residence",
                "price_min": 5000 ,
                "price_max": 6700,
                "description": "At the door of the University of the Witwatersrand, Verge 2 offers you secure rooms with the best aesthetic views. ",
                "amenities": json.dumps([" 24/7 security","Study Room","Wi-fi","Gym","Laundry",]),
                "contact_info": "063-360-1558|info@bornfreerentals.co.za",
                "university": "wits",
                "approved": True
            },
            {   
                "name": "Thutong", 
                "address": " 22 Jorissen, Braamfontein, Johannesburg",
                "property_type": "residence",
                "price_min": 5000 ,
                "price_max": 5000, #all rooms cost 5000
                "description": " Student accommodation with spacious rooms designed specifically for student living. ",
                "amenities": json.dumps([" 24/7 security","Wi-fi","Gym","Laundry",]),
                "contact_info": "021-002-5051| info@thutongjunction.co.za",
                "university": "wits",
                "approved": True
            },
            {   
                "name": " UGate student residence", 
                "address": " Corner Bertha and, Ameshoff St, Braamfontein, Johannesburg",
                "property_type": "residence",
                "price_min": 4500 ,
                "price_max": 8200,
                "description": "Offers premium student accommodation that supports privacy within a vibrant student community",
                "amenities": json.dumps([" 24/7 security","Wi-fi","Study Area","Laundry","Entertainment Room",]),
                "contact_info": "087-078-2143| info@ugate.co.za ",
                "university": "wits & uj",
                "approved": True
            },
            {   
                "name": " 93 on Juta", 
                "address": " 93 Juta, Braamfontein, Johannesburg",
                "property_type": "residence",
                "price_min": 3900 ,
                "price_max": 6300,
                "description": "A space that allows you to focus on your studies.",
                "amenities": json.dumps([" 24/7 security","Wi-fi",]),
                "contact_info": "083-264-0005| goldencitystudentres@gmail.com",
                "university": "wits & uj",
                "approved": True
            },
            {   
                "name": " 95 on Juta", 
                "address": " 95 Juta, Braamfontein, Johannesburg",
                "property_type": "residence",
                "price_min": 3500 ,
                "price_max": 4100,
                "description": "A space that allows you to focus on your studies.",
                "amenities": json.dumps([" 24/7 security","Wi-fi",]),
                "contact_info": "083-264-0005| goldencitystudentres@gmail.com",
                "university": "wits & uj",
                "approved": True
            },
            {   
                "name": " Student Digz-Dudley ", 
                "address": " 145 De Korte Street, Braamfontein, Johannesburg",
                "property_type": "residence",
                "price_min": 4600 ,
                "price_max": 5000,
                "description": "Situated in one precinct, Student Digz residences are situated in one block. One entrance, one garden and amenities in one block.  ",
                "amenities": json.dumps([" 24/7 security","Wi-fi","Study Area","Transport","Laundry","Gym","Entertainment Room",]),
                "contact_info": "010-055-1451| info@studentdigz.co.za",
                "university": "wits & uj",
                "approved": True
            },
            {   
                "name": " Student Digz-Baker House ", 
                "address": " 11 Hosptital Street, Braamfontein, Johannesburg",
                "property_type": "apartments",
                "price_min": 4800 ,
                "price_max": 6300,
                "description": "Situated in one precinct, Student Digz residences are situated in one block. One entrance, one garden and amenities in one block.  ",
                "amenities": json.dumps([" 24/7 security","Wi-fi","Study Area","Transport","Laundry","Gym","Entertainment Room",]),
                "contact_info": "010-055-1451| info@studentdigz.co.za",
                "university": "wits & uj",
                "approved": True
            },
            {   
                "name": " Student Digz-Skyways ", 
                "address": " 12 Sutherland Avenue, Braamfontein, Johannesburg",
                "property_type": "apartments",
                "price_min": 4800 ,
                "price_max": 5000,
                "description": "Situated in one precinct, Student Digz residences are situated in one block. One entrance, one garden and amenities in one block. ",
                "amenities": json.dumps([" 24/7 security","Wi-fi","Study Area","Transport","Laundry","Gym","Entertainment Room",]),
                "contact_info": "010-055-1451| info@studentdigz.co.za",
                "university": "wits & uj",
                "approved": True
            },
        ]
        
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
