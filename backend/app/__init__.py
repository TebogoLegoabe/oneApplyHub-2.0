from flask_migrate import Migrate
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mail import Mail
import os

db = SQLAlchemy()
jwt = JWTManager()
mail = Mail()
migrate = Migrate()

def create_app(config_class=None):
    app = Flask(__name__)
    
    # Database configuration
    if os.environ.get('RAILWAY_ENVIRONMENT'):
        # Production configuration for Railway
        app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-production-secret-key')
        app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'your-production-jwt-key')
        # Use SQLite in Railway's file system
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///studentstay.db'
        print("🚀 Running in PRODUCTION mode (Railway)")
        
        # CORS for your Vercel frontend
        CORS(app, origins=[
            'https://your-vercel-app.vercel.app',  # Replace with your actual Vercel URL
            'http://localhost:3000'
        ])
        
    else:
        # Local development configuration (your existing setup)
        backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        forced_db_path = os.path.join(backend_dir, 'studentstay.db')
        
        app.config['SECRET_KEY'] = 'dev-secret-key-change-in-production'
        app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{forced_db_path}'
        app.config['JWT_SECRET_KEY'] = 'dev-secret-key-change-in-production'
        print(f"🏠 Running in DEVELOPMENT mode")
        print(f"DATABASE PATH: {forced_db_path}")
        
        # In the Railway/production section:
        CORS(app, origins=[
         'https://one-apply-hub-2-0-36087sdn5-tebogolegoabes-projects.vercel.app', 
         'http://localhost:3000'
])
    
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    mail.init_app(app)
    
    # Register blueprints
    try:
        from app.routes.auth import auth_bp
        from app.routes.properties import properties_bp
        from app.routes.reviews import reviews_bp
        
        app.register_blueprint(auth_bp, url_prefix='/api/auth')
        app.register_blueprint(properties_bp, url_prefix='/api/properties')
        app.register_blueprint(reviews_bp, url_prefix='/api/reviews')
        print("✅ All blueprints registered successfully")
        
    except ImportError as e:
        print(f"❌ Blueprint import error: {e}")
    
    return app