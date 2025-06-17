from app import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    name = db.Column(db.String(100), nullable=False)
    university = db.Column(db.String(50), nullable=False)  # 'wits' or 'uj'
    year_of_study = db.Column(db.String(20))
    faculty = db.Column(db.String(100))
    verified = db.Column(db.Boolean, default=False)
    is_admin = db.Column(db.Boolean, default=False)  
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    reviews = db.relationship('Review', backref='author', lazy='dynamic')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'university': self.university,
            'year_of_study': self.year_of_study,
            'faculty': self.faculty,
            'verified': self.verified,
            'is_admin': self.is_admin, 
            'created_at': self.created_at.isoformat()
        }