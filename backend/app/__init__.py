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
migrate=Migrate()

def create_app(config_class=None):
    app = Flask(__name__)
    
    # FORCE the database path - override everything
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    forced_db_path = os.path.join(backend_dir, 'studentstay.db')
    
    app.config['SECRET_KEY'] = 'dev-secret-key-change-in-production'
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{forced_db_path}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = 'dev-secret-key-change-in-production'
    
    print(f"FORCED DATABASE PATH: {forced_db_path}")
    print(f"DATABASE EXISTS: {os.path.exists(forced_db_path)}")
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app, origins=['http://localhost:3000'])
    jwt.init_app(app)
    mail.init_app(app)
    
    # Register blueprints - MAKE SURE THESE IMPORTS WORK
    try:
        from app.routes.auth import auth_bp
        from app.routes.properties import properties_bp
        from app.routes.reviews import reviews_bp
        #from app.routes.admin import admin_bp
        
        app.register_blueprint(auth_bp, url_prefix='/api/auth')
        app.register_blueprint(properties_bp, url_prefix='/api/properties')
        app.register_blueprint(reviews_bp, url_prefix='/api/reviews')
        #app.register_blueprint(admin_bp, url_prefix='/api/admin')

        print("✅ All blueprints registered successfully")
        
    except ImportError as e:
        print(f"❌ Blueprint import error: {e}")
    
    return app