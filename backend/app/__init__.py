import logging
import os

from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_mail import Mail
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func, text

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(name)s: %(message)s',
)
logger = logging.getLogger(__name__)

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
mail = Mail()
limiter = Limiter(key_func=get_remote_address)


def create_app():
    app = Flask(__name__)

    from config import Config
    Config.validate()
    app.config.from_object(Config)

    allowed_origins = [
        r'http://localhost:3000',
        r'https://.*\.vercel\.app',
        'https://www.oneapplyhub.co.za',
        'https://oneapplyhub.co.za',
    ]
    frontend_url = os.environ.get('FRONTEND_URL')
    if frontend_url:
        allowed_origins.append(frontend_url)

    CORS(
        app,
        resources={r'/api/*': {'origins': allowed_origins}},
        supports_credentials=True,
        allow_headers=['Content-Type', 'Authorization'],
        methods=['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        expose_headers=['Content-Type', 'Authorization'],
    )

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    mail.init_app(app)
    limiter.init_app(app)

    from app.models import User, Property, Review, PropertyImage, HelpfulVote, PropertyAdmin  # noqa: F401
    from app.models.application import Application  # noqa: F401
    from app.models.applicant_profile import ApplicantProfile, AcademicResult  # noqa: F401
    from app.models.accommodation_application import AccommodationApplication, AccommodationApplicationProperty  # noqa: F401
    from app.models.university_application import UniversityApplication, UniversityApplicationChoice  # noqa: F401

    from app.routes.auth import auth_bp
    from app.routes.properties import properties_bp
    from app.routes.reviews import reviews_bp
    from app.routes.admin import admin_bp
    from app.routes.applications import applications_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(properties_bp, url_prefix='/api/properties')
    app.register_blueprint(reviews_bp, url_prefix='/api/reviews')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(applications_bp, url_prefix='/api/applications')

    @app.route('/')
    def health():
        return jsonify(status='ok', message='oneApplyHub API is running'), 200

    @app.route('/api/stats')
    def public_stats():
        from app.models import Property, Review, User
        avg = db.session.query(func.avg(Review.overall_rating)).filter_by(approved=True).scalar()
        return jsonify({
            'properties': Property.query.filter_by(approved=True).count(),
            'students': User.query.filter_by(verified=True).count(),
            'reviews': Review.query.filter_by(approved=True).count(),
            'avg_rating': round(float(avg), 1) if avg else None,
        }), 200

    @app.route('/api/health')
    def api_health():
        try:
            db.session.execute(text('SELECT 1'))
            db_status = 'connected'
        except Exception as exc:
            logger.error('DB health check failed: %s', exc)
            db_status = 'error'
        return jsonify({
            'status': 'ok',
            'database': db_status,
            'environment': os.environ.get('FLASK_ENV', 'production'),
        }), 200

    @app.errorhandler(404)
    def not_found(_):
        return jsonify(error='Not found'), 404

    @app.errorhandler(405)
    def method_not_allowed(_):
        return jsonify(error='Method not allowed'), 405

    @app.errorhandler(429)
    def rate_limit_exceeded(_):
        return jsonify(error='Too many requests — please try again later'), 429

    @app.errorhandler(500)
    def internal_error(_):
        return jsonify(error='Internal server error'), 500

    return app
