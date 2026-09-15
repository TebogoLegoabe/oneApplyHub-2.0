import json
import os
import sys
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('FLASK_ENV', 'production')

from app import create_app, db
from app.models import Opportunity

app = create_app()

with app.app_context():
    with open('backend/data/opportunities.json') as f:
        data = json.load(f)

    Opportunity.query.delete()
    db.session.commit()

    for item in data:
        deadline = datetime.fromisoformat(item['deadline'].replace('Z', '+00:00')) if item.get('deadline') else None
        opp = Opportunity(
            title=item['title'],
            provider=item['provider'],
            opportunity_type=item['opportunity_type'],
            location=item.get('location'),
            duration=item.get('duration'),
            field=item.get('field'),
            description=item.get('description'),
            requirements=item.get('requirements'),
            salary_range=item.get('salary_range'),
            application_url=item['application_url'],
            deadline=deadline,
            status=item.get('status', 'open'),
        )
        db.session.add(opp)

    db.session.commit()
    print(f'Seeded {len(data)} opportunities')
