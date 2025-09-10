# app/__init__.py
from flask import Flask, jsonify
from flask_cors import CORS
import os

def create_app(config_class=None):
    app = Flask(__name__)

    # Secrets
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret")
    app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "dev-jwt")

    # Database
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
        "DATABASE_URL",  # use Railway Postgres if you add it
        "sqlite:///studentstay.db",  # fallback
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # CORS
    allowed = [
        "https://one-apply-hub-2-0-36087sdn5-tebogolegoabes-projects.vercel.app",
        "http://localhost:3000",
    ]
    CORS(
        app,
        resources={r"/api/*": {"origins": allowed}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        expose_headers=["Content-Type", "Authorization"],
    )

    # blueprints...
    from app.routes.auth import auth_bp
    from app.routes.properties import properties_bp
    from app.routes.reviews import reviews_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(properties_bp, url_prefix="/api/properties")
    app.register_blueprint(reviews_bp, url_prefix="/api/reviews")

    # simple health check for your testConnection
    @app.get("/")
    def health():
        return jsonify(status="ok"), 200

    return app
