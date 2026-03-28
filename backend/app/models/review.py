from datetime import datetime, timezone

from app import db


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Review(db.Model):
    __tablename__ = 'review'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, index=True)
    property_id = db.Column(db.Integer, db.ForeignKey('property.id'), nullable=False, index=True)

    # Ratings (1-5, overall is required)
    overall_rating = db.Column(db.Integer, nullable=False)
    value_rating = db.Column(db.Integer)
    location_rating = db.Column(db.Integer)
    safety_rating = db.Column(db.Integer)
    cleanliness_rating = db.Column(db.Integer)
    management_rating = db.Column(db.Integer)
    facilities_rating = db.Column(db.Integer)

    # Content
    review_text = db.Column(db.Text, nullable=False)
    pros = db.Column(db.Text)
    cons = db.Column(db.Text)
    recommend = db.Column(db.Boolean, nullable=False)
    anonymous = db.Column(db.Boolean, default=False, nullable=False)

    # Engagement
    helpful_count = db.Column(db.Integer, default=0, nullable=False)

    # Moderation — admin must approve before review is publicly visible
    approved = db.Column(db.Boolean, default=False, nullable=False)

    created_at = db.Column(db.DateTime(timezone=True), default=_utcnow, nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), default=_utcnow, onupdate=_utcnow, nullable=False)

    # One review per user per property
    __table_args__ = (
        db.UniqueConstraint('user_id', 'property_id', name='uq_review_user_property'),
    )

    def to_dict(self) -> dict:
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
            'approved': self.approved,
            'author': self.author.name if not self.anonymous else 'Anonymous',
            'author_university': self.author.university if not self.anonymous else None,
            'author_year': self.author.year_of_study if not self.anonymous else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }


class HelpfulVote(db.Model):
    """Tracks which users have marked a review as helpful — prevents duplicate votes."""
    __tablename__ = 'helpful_vote'

    id = db.Column(db.Integer, primary_key=True)
    review_id = db.Column(db.Integer, db.ForeignKey('review.id', ondelete='CASCADE'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=_utcnow, nullable=False)

    __table_args__ = (
        db.UniqueConstraint('review_id', 'user_id', name='uq_helpful_vote_review_user'),
    )
