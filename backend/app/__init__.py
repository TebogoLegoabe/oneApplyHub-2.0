from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mail import Mail
import os

db = SQLAlchemy()
jwt = JWTManager()
mail = Mail()

def create_app(config_class=None):
    app = Flask(__name__)

    # FORCE the database path - override everything
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    forced_db_path = os.path.join(backend_dir, 'studentstay.db')
    
    # Configs
    app.config['SECRET_KEY'] = 'dev-secret-key-change-in-production'
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{forced_db_path}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = 'dev-secret-key-change-in-production'

    # MAIL CONFIG 
    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USE_SSL'] = False
    app.config['MAIL_DEFAULT_SENDER'] = 'macbethgamer8@gmail.com'
    app.config['MAIL_USERNAME'] = 'macbethgamer8@gmail.com'
    app.config['MAIL_PASSWORD']= 'dcmf vwdp zwwa nyrm'  

    print(f"FORCED DATABASE PATH: {forced_db_path}")
    print(f"DATABASE EXISTS: {os.path.exists(forced_db_path)}")
    
    # Initialize extensions
    db.init_app(app)
    CORS(app, origins=['http://localhost:3000'])
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
