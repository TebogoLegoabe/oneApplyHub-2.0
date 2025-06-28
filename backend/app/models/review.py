from app import db
from datetime import datetime

class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    property_id = db.Column(db.Integer, db.ForeignKey('property.id'), nullable=False)
    
    # Ratings (1-5)
    overall_rating = db.Column(db.Integer, nullable=False)
    value_rating = db.Column(db.Integer)
    location_rating = db.Column(db.Integer)
    safety_rating = db.Column(db.Integer)
    cleanliness_rating = db.Column(db.Integer)
    management_rating = db.Column(db.Integer)
    facilities_rating = db.Column(db.Integer)
    
    # Review content
    review_text = db.Column(db.Text, nullable=False)
    pros = db.Column(db.Text)
    cons = db.Column(db.Text)
    recommend = db.Column(db.Boolean)
    anonymous = db.Column(db.Boolean, default=False)
    
    # Engagement
    helpful_count = db.Column(db.Integer, default=0)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'property_id': self.property_id,
            'overall_rating': self.overall_rating,
            'value_rating': self.value_rating,
            'location_rating': self.location_rating,
            'safety_rating': self.safety_rating,
            'cleanliness_rating': self.cleanliness_rating,
            'management_rating': self.management_rating,
            'facilities_rating': self.facilities_rating,
            'review_text': self.review_text,
            'pros': self.pros,
            'cons': self.cons,
            'recommend': self.recommend,
            'anonymous': self.anonymous,
            'helpful_count': self.helpful_count,
            'author': self.author.name if not self.anonymous else 'Anonymous',
            'author_university': self.author.university if not self.anonymous else None,
            'author_year': self.author.year_of_study if not self.anonymous else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }