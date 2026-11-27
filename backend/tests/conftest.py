"""Pytest fixtures: a throwaway SQLite database per test, created from the models."""
import os
import sys
import tempfile

# Must be set before the app (and config) is imported.
_DB_DIR = tempfile.mkdtemp(prefix='oneapplyhub-tests-')
os.environ['DATABASE_URL'] = f'sqlite:///{os.path.join(_DB_DIR, "test.db")}'
os.environ['FLASK_ENV'] = 'development'
os.environ.setdefault('SECRET_KEY', 'test-secret')
os.environ.setdefault('JWT_SECRET_KEY', 'test-jwt-secret-with-enough-length-1234')

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest  # noqa: E402
from flask_jwt_extended import create_access_token  # noqa: E402

from app import create_app, db as _db, limiter  # noqa: E402


@pytest.fixture(scope='session')
def app():
    application = create_app()
    application.config.update(TESTING=True)
    limiter.enabled = False
    return application


@pytest.fixture()
def db(app):
    with app.app_context():
        _db.drop_all()
        _db.create_all()
        yield _db
        _db.session.remove()


@pytest.fixture()
def client(app, db):
    return app.test_client()


@pytest.fixture()
def make_property(db):
    from app.models import Property

    def _make(name, latitude=None, longitude=None, **overrides):
        fields = dict(
            name=name, address=f'{name} Street, Braamfontein', property_type='residence', university='wits',
            price_min=4000, price_max=6000, approved=True, nsfas_accredited=False,
            latitude=latitude, longitude=longitude, geo_precision='building' if latitude is not None else None,
        )
        fields.update(overrides)
        prop = Property(**fields)
        db.session.add(prop)
        db.session.commit()
        return prop

    return _make


@pytest.fixture()
def admin_headers(db):
    from app.models import User

    admin = User(email='admin@example.com', name='Admin', university='wits', verified=True, is_admin=True, is_super_admin=True)
    admin.set_password('Password123')
    db.session.add(admin)
    db.session.commit()
    return {'Authorization': f'Bearer {create_access_token(identity=str(admin.id))}'}
