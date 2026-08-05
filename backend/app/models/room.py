from app import db
from app.utils import utcnow

ROOM_TYPES = ('single', 'double')
ROOM_CAPACITY = {'single': 1, 'double': 2}


class Floor(db.Model):
    """One floor of a property's building layout, editable by the property's admin."""
    __tablename__ = 'floor'

    id = db.Column(db.Integer, primary_key=True)
    property_id = db.Column(db.Integer, db.ForeignKey('property.id'), nullable=False, index=True)
    floor_number = db.Column(db.Integer, nullable=False)
    label = db.Column(db.String(100))
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)

    __table_args__ = (
        db.UniqueConstraint('property_id', 'floor_number', name='uq_floor_property_number'),
    )

    rooms = db.relationship('Room', backref='floor', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self, include_rooms=False):
        d = {
            'id': self.id,
            'property_id': self.property_id,
            'floor_number': self.floor_number,
            'label': self.label,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
        if include_rooms:
            d['rooms'] = [r.to_dict() for r in self.rooms.order_by(Room.room_number)]
        return d


class Room(db.Model):
    """An individually numbered room, e.g. '510' for floor 5 room 10."""
    __tablename__ = 'room'

    id = db.Column(db.Integer, primary_key=True)
    property_id = db.Column(db.Integer, db.ForeignKey('property.id'), nullable=False, index=True)
    floor_id = db.Column(db.Integer, db.ForeignKey('floor.id'), nullable=False, index=True)
    room_number = db.Column(db.String(20), nullable=False)
    room_type = db.Column(db.String(20), nullable=False)  # 'single' | 'double'
    capacity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Integer)
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)

    __table_args__ = (
        db.UniqueConstraint('property_id', 'room_number', name='uq_room_property_number'),
    )

    allocations = db.relationship('RoomAllocation', backref='room', lazy='dynamic', cascade='all, delete-orphan')

    def active_allocations(self):
        return self.allocations.filter_by(status='active').all()

    def to_dict(self, include_occupants=False):
        active = self.active_allocations()
        d = {
            'id': self.id,
            'property_id': self.property_id,
            'floor_id': self.floor_id,
            'floor_number': self.floor.floor_number if self.floor else None,
            'room_number': self.room_number,
            'room_type': self.room_type,
            'capacity': self.capacity,
            'price': self.price,
            'occupied_count': len(active),
            'is_full': len(active) >= self.capacity,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
        if include_occupants:
            d['occupants'] = [a.to_dict() for a in active]
        return d


class RoomAllocation(db.Model):
    """One approved applicant occupying a room. A double room can have up to
    2 active allocations; a single room only 1."""
    __tablename__ = 'room_allocation'

    id = db.Column(db.Integer, primary_key=True)
    room_id = db.Column(db.Integer, db.ForeignKey('room.id'), nullable=False, index=True)
    accommodation_application_property_id = db.Column(
        db.Integer, db.ForeignKey('accommodation_application_property.id'), nullable=False, index=True,
    )
    allocated_by_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    allocated_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)
    vacated_at = db.Column(db.DateTime(timezone=True), nullable=True)
    status = db.Column(db.String(20), default='active', nullable=False)  # 'active' | 'vacated'

    allocated_by = db.relationship('User', foreign_keys=[allocated_by_user_id])
    application_property = db.relationship('AccommodationApplicationProperty', backref=db.backref('room_allocations', lazy='dynamic'))

    def to_dict(self):
        app_property = self.application_property
        application = app_property.application if app_property else None
        applicant = application.user if application else None
        return {
            'id': self.id,
            'room_id': self.room_id,
            'accommodation_application_property_id': self.accommodation_application_property_id,
            'applicant_name': applicant.name if applicant else None,
            'applicant_email': applicant.email if applicant else None,
            'allocated_by_user_id': self.allocated_by_user_id,
            'allocated_by_name': self.allocated_by.name if self.allocated_by else 'System (auto-allocated)',
            'allocated_at': self.allocated_at.isoformat() if self.allocated_at else None,
            'vacated_at': self.vacated_at.isoformat() if self.vacated_at else None,
            'status': self.status,
        }
