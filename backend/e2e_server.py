"""
API server for the Playwright end-to-end tests (frontend/e2e). TEST HARNESS ONLY — never deploy.

What it does, every start:
  * points the app at a throwaway SQLite database (never your .env / Postgres)
  * recreates the schema and seeds real data from data/*.json (properties with
    map coordinates, photos, bursaries, opportunities) plus known test accounts
    and a few approved reviews
  * suppresses outgoing email and turns rate limiting off
  * adds GET /api/__e2e__/verification-code?email=... so the e2e suite can
    complete the register -> verify -> log in flow without a mailbox

Usage (from backend/):
    python e2e_server.py            # port 5001, frontend origin http://localhost:3100
Env overrides: E2E_PORT, E2E_FRONTEND_URL, E2E_DB_PATH
"""
import json
import os
import sys
import tempfile
from datetime import date, datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.environ.get('E2E_DB_PATH') or os.path.join(tempfile.gettempdir(), 'oneapplyhub-e2e.db')
PORT = int(os.environ.get('E2E_PORT', '5001'))

os.environ.update({
    'DATABASE_URL': f'sqlite:///{DB_PATH}',
    'FLASK_ENV': 'development',
    'SECRET_KEY': 'e2e-secret-key',
    'JWT_SECRET_KEY': 'e2e-jwt-secret-key-at-least-32-bytes-long',
    'FRONTEND_URL': os.environ.get('E2E_FRONTEND_URL', 'http://localhost:3100'),
    # Mail "configured" but suppressed, so registration succeeds without SMTP.
    'MAIL_USERNAME': 'e2e@example.test',
    'MAIL_PASSWORD': 'unused',
    'MAIL_DEFAULT_SENDER': 'noreply@example.test',
})
for key in ('REDIS_URL', 'CLOUDINARY_URL', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'):
    os.environ.pop(key, None)

sys.path.insert(0, BASE_DIR)

from flask import Blueprint, jsonify, request  # noqa: E402

from app import create_app, db, limiter, mail  # noqa: E402
from app.models import Bursary, Opportunity, Property, PropertyImage, Review, User  # noqa: E402

STUDENT = {'email': 'thandi@e2e.test', 'password': 'Password123', 'name': 'Thandi Nkosi'}
ADMIN = {'email': 'admin@e2e.test', 'password': 'Password123', 'name': 'Ada Admin'}


def _load(name):
    with open(os.path.join(BASE_DIR, 'data', name), encoding='utf-8') as handle:
        return json.load(handle)


def seed():
    columns = {column.name for column in Property.__table__.columns} - {'id', 'created_at'}
    for record in _load('properties.json'):
        fields = {key: value for key, value in record.items() if key in columns}
        if isinstance(fields.get('amenities'), list):
            fields['amenities'] = json.dumps(fields['amenities'])
        db.session.add(Property(**fields))
    db.session.flush()

    by_name = {prop.name: prop for prop in Property.query.all()}
    for record in _load('property_images.json'):
        prop = by_name.get(record['name'])
        if prop:
            db.session.add(PropertyImage(property_id=prop.id, image_url=record['image_url'], is_primary=True))

    for record in _load('bursaries.json'):
        db.session.add(Bursary(
            title=record['title'], provider=record.get('provider'), funder=record.get('funder'), field=record.get('field'),
            amount=record.get('amount'), amount_value=record.get('amountValue'),
            deadline=date.fromisoformat(record['deadline']) if record.get('deadline') else None,
            level=json.dumps(record.get('level', [])), university=record.get('university'),
            description=record.get('description'), requirements=json.dumps(record.get('requirements', [])),
            application_url=record.get('applicationUrl'), status=record.get('status', 'Open'),
        ))

    for record in _load('opportunities.json'):
        deadline = datetime.fromisoformat(record['deadline'].replace('Z', '+00:00')) if record.get('deadline') else None
        db.session.add(Opportunity(
            title=record['title'], provider=record['provider'], opportunity_type=record['opportunity_type'],
            location=record.get('location'), duration=record.get('duration'), field=record.get('field'),
            description=record.get('description'), requirements=record.get('requirements'),
            salary_range=record.get('salary_range'), application_url=record['application_url'],
            deadline=deadline, status=record.get('status', 'open'),
        ))

    student = User(email=STUDENT['email'], name=STUDENT['name'], university='wits', year_of_study='2nd Year', faculty='Science', verified=True)
    student.set_password(STUDENT['password'])
    reviewer = User(email='sipho@e2e.test', name='Sipho Dlamini', university='uj', year_of_study='3rd Year', faculty='Engineering', verified=True)
    reviewer.set_password(STUDENT['password'])
    admin = User(email=ADMIN['email'], name=ADMIN['name'], university='wits', verified=True, is_admin=True, is_super_admin=True)
    admin.set_password(ADMIN['password'])
    db.session.add_all([student, reviewer, admin])
    db.session.flush()

    reviews = [
        (student, 'Braamfontein Gate', 5, 'Five minutes to class and the security team is excellent. WiFi is quick.', 'Close to campus', 'Lifts can be slow'),
        (reviewer, 'Braamfontein Gate', 4, 'Good value for Braamfontein and the study rooms are quiet at night.', 'Study rooms', 'Busy laundry on Sundays'),
        (student, 'Campus Africa - Rennie House', 4, 'Friendly management and an easy walk to the Wits main gate.', 'Management', 'Small kitchens'),
        (reviewer, 'Thrive Living - Kingsway Place', 3, 'Convenient for UJ Kingsway but noisy on weekends.', 'Walk to UJ', 'Noise'),
    ]
    for author, property_name, rating, text, pros, cons in reviews:
        db.session.add(Review(
            user_id=author.id, property_id=by_name[property_name].id, overall_rating=rating, review_text=text,
            pros=pros, cons=cons, recommend=rating >= 4, approved=True,
        ))
    db.session.commit()


e2e_bp = Blueprint('e2e', __name__)


@e2e_bp.route('/verification-code', methods=['GET'])
def verification_code():
    user = User.query.filter_by(email=(request.args.get('email') or '').strip().lower()).first()
    if not user or not user.verification_code:
        return jsonify({'error': 'No pending code'}), 404
    return jsonify({'code': user.verification_code}), 200


def build_app():
    app = create_app()
    app.config.update(TESTING=True, MAIL_SUPPRESS_SEND=True, RATELIMIT_ENABLED=False)
    mail.init_app(app)  # re-read MAIL_SUPPRESS_SEND
    limiter.enabled = False
    app.register_blueprint(e2e_bp, url_prefix='/api/__e2e__')
    with app.app_context():
        db.drop_all()
        db.create_all()
        seed()
        print(f'[e2e] Seeded {Property.query.count()} properties, {Review.query.count()} reviews into {DB_PATH}', flush=True)
    return app


if __name__ == '__main__':
    build_app().run(host='127.0.0.1', port=PORT, debug=False, use_reloader=False, threaded=True)
