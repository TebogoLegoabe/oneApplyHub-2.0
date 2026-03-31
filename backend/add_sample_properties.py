import json
import os

def add_sample_properties():
    from app import db
    from app.models import Property

    # Check if properties already exist
    if Property.query.count() > 0:
        print("Properties already exist, skipping seed.")
        return

    # Load from JSON file
    json_path = os.path.join(os.path.dirname(__file__), 'data', 'properties.json')
    with open(json_path, 'r') as f:
        properties_data = json.load(f)

    for prop in properties_data:
        property = Property(
            name=prop['name'],
            address=prop['address'],
            property_type=prop['property_type'],
            university=prop['university'],
            price_min=prop['price_min'],
            price_max=prop['price_max'],
            nsfas_accredited=prop['nsfas_accredited'],
            description=prop['description'],
            amenities=prop['amenities'],
            contact_info=prop['contact_info'],
            approved=prop['approved'],
        )
        db.session.add(property)

    db.session.commit()
    print(f"Added {len(properties_data)} properties successfully!")
