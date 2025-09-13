from app import db
from datetime import datetime

class Property(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    address = db.Column(db.Text, nullable=False)
    property_type = db.Column(db.String(50), nullable=False)  # 'residence', 'apartment', 'house'
    price_min = db.Column(db.Integer)
    price_max = db.Column(db.Integer)
    description = db.Column(db.Text)
    amenities = db.Column(db.Text)  # JSON string
    contact_info = db.Column(db.Text)
    university = db.Column(db.String(50))  # 'wits', 'uj', or 'both'
    approved = db.Column(db.Boolean, default=False)
    nsfas_accredited = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    reviews = db.relationship('Review', backref='property', lazy='dynamic')
    images = db.relationship('PropertyImage', backref='property', lazy='dynamic')
    
    def average_rating(self):
        reviews = self.reviews.all()
        if not reviews:
            return 0
        return sum(review.overall_rating for review in reviews) / len(reviews)
    
    def review_count(self):
        return self.reviews.count()
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'address': self.address,
            'property_type': self.property_type,
            'price_min': self.price_min,
            'price_max': self.price_max,
            'description': self.description,
            'amenities': self.amenities,
            'contact_info': self.contact_info,
            'university': self.university,
            'approved': self.approved,
            'nsfas_accredited': self.nsfas_accredited,
            'average_rating': round(self.average_rating(), 1),
            'review_count': self.review_count(),
            'created_at': self.created_at.isoformat()
        }

class PropertyImage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    property_id = db.Column(db.Integer, db.ForeignKey('property.id'), nullable=False)
    image_url = db.Column(db.String(500), nullable=False)
    caption = db.Column(db.String(200))
    is_primary = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
