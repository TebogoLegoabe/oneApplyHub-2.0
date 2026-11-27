from sqlalchemy import func

from app import db
from app.utils import utcnow


class Property(db.Model):
    __tablename__ = 'property'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    address = db.Column(db.Text, nullable=False)
    property_type = db.Column(db.String(50), nullable=False)  # 'residence', 'apartment', 'house'
    price_min = db.Column(db.Integer)
    price_max = db.Column(db.Integer)
    description = db.Column(db.Text)
    amenities = db.Column(db.Text)   # JSON string
    contact_info = db.Column(db.Text)
    website = db.Column(db.String(500))
    university = db.Column(db.String(50))  # 'wits', 'uj', or 'both'
    approved = db.Column(db.Boolean, default=False, nullable=False)
    nsfas_accredited = db.Column(db.Boolean, default=False, nullable=False)
    # Map position (WGS84). geo_precision records how the pin was placed:
    # 'exact' (admin picked it on the map), 'building' / 'address' (geocoded),
    # or 'street' (street midpoint only — distances are approximate).
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    geo_precision = db.Column(db.String(20), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)

    # Relationships
    reviews = db.relationship('Review', backref='property', lazy='dynamic')
    images = db.relationship('PropertyImage', backref='property', lazy='dynamic')

    def average_rating(self) -> float:
        # Uses a SQL aggregate — avoids loading all review objects into memory
        from app.models.review import Review  # local import to avoid circular
        result = db.session.query(func.avg(Review.overall_rating)).filter(
            Review.property_id == self.id,
            Review.approved == True,  # noqa: E712
        ).scalar()
        return round(float(result), 1) if result else 0.0

    def review_count(self) -> int:
        from app.models.review import Review  # local import to avoid circular
        return db.session.query(func.count(Review.id)).filter(
            Review.property_id == self.id,
            Review.approved == True,  # noqa: E712
        ).scalar() or 0

    def ordered_images(self):
        return self.images.order_by(PropertyImage.is_primary.desc(), PropertyImage.created_at.asc()).all()

    @property
    def has_location(self) -> bool:
        return self.latitude is not None and self.longitude is not None

    def to_dict(self, rating_stats=None) -> dict:
        """rating_stats: optional precomputed (average, count) to avoid two queries per property."""
        images = [img.to_dict() for img in self.ordered_images()]
        average, count = rating_stats if rating_stats is not None else (self.average_rating(), self.review_count())
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
            'website': self.website,
            'university': self.university,
            'approved': self.approved,
            'nsfas_accredited': self.nsfas_accredited,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'geo_precision': self.geo_precision,
            'average_rating': round(average or 0.0, 1),
            'review_count': count or 0,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'images': images,
            'primary_image_url': images[0]['image_url'] if images else None,
        }


class PropertyImage(db.Model):
    __tablename__ = 'property_image'

    id = db.Column(db.Integer, primary_key=True)
    property_id = db.Column(db.Integer, db.ForeignKey('property.id'), nullable=False)
    image_url = db.Column(db.String(500), nullable=False)
    caption = db.Column(db.String(200))
    is_primary = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'property_id': self.property_id,
            'image_url': self.image_url,
            'caption': self.caption,
            'is_primary': self.is_primary,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
