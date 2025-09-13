# backend/app/__init__.py - Fixed version with proper db export
from flask import Flask, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
import os

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app(config_class=None):
    app = Flask(__name__)

    # Configuration
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret")
    app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "dev-jwt")

    # SQLite Database configuration
    if os.environ.get('RAILWAY_ENVIRONMENT'):
        # Railway production - use persistent path
        db_path = os.path.join("/app", "studentstay.db")
    else:
        # Local development
        db_path = "studentstay.db"
    
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path}"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    allowed_origins = [
    "http://localhost:3000",  # Local development
    "https://one-apply-hub-2-0.vercel.app",  # Main Vercel domain
    "https://one-apply-hub-2-0-git-main-tebogolegoabes-projects.vercel.app",  # Git deployment
    "https://one-apply-hub-2-0-omqm6pe33-tebogolegoabes-projects.vercel.app",  # Latest deployment
    ]
    
    # Add production frontend URL from environment
    frontend_url = os.environ.get('FRONTEND_URL')
    if frontend_url and frontend_url not in allowed_origins:
        allowed_origins.append(frontend_url)
    
    # Add any additional Vercel preview URLs
    vercel_url = os.environ.get('VERCEL_URL')
    if vercel_url:
        allowed_origins.extend([
            f"https://{vercel_url}",
            f"https://{vercel_url}.vercel.app"
        ])

    CORS(
        app,
        resources={r"/api/*": {"origins": allowed_origins}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        expose_headers=["Content-Type", "Authorization"],
    )

    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # Import models (needed for migrations)
    from app.models import User, Property, Review, PropertyImage

    # Create tables if they don't exist
    with app.app_context():
        try:
            db.create_all()
            print("Database tables created successfully")
        except Exception as e:
            print(f"Database initialization error: {e}")

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.properties import properties_bp
    from app.routes.reviews import reviews_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(properties_bp, url_prefix="/api/properties")
    app.register_blueprint(reviews_bp, url_prefix="/api/reviews")

    # Health check endpoints
    @app.route('/')
    def health():
        return jsonify(status="ok", message="oneApplyHub API is running!"), 200
    
    @app.route('/api/health')
    def api_health():
        try:
            # Test database connection
            db.session.execute('SELECT 1')
            db_status = "connected"
        except Exception as e:
            db_status = f"error: {str(e)}"
        
        return jsonify({
            "status": "ok",
            "message": "oneApplyHub API is healthy",
            "database": db_status,
            "environment": os.environ.get("RAILWAY_ENVIRONMENT", "development")
        }), 200

    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify(error="Not found"), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify(error="Internal server error"), 500

    return app