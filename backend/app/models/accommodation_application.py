from app import db
from app.utils import utcnow

VALID_STATUSES = ('pending', 'under_review', 'approved', 'rejected')


def _overall_status(statuses):
    if not statuses:
        return 'pending'
    if all(s == 'approved' for s in statuses):
        return 'approved'
    if all(s == 'rejected' for s in statuses):
        return 'rejected'
    if 'approved' in statuses:
        return 'partially_approved'
    if 'under_review' in statuses:
        return 'under_review'
    return 'pending'


class AccommodationApplication(db.Model):
    """The shared accommodation submission — one per student. Per-property
    decisions live on AccommodationApplicationProperty so one property
    admin's call never affects another's."""
    __tablename__ = 'accommodation_application'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, unique=True)
    reference = db.Column(db.String(20), unique=True, nullable=False)

    room_type = db.Column(db.String(20))  # 'single' | 'double'
    special_requirements = db.Column(db.Text)

    # Base64 data URIs — accommodation-specific documents
    proof_of_registration = db.Column(db.Text)
    bank_statement = db.Column(db.Text)
    nsfas_letter = db.Column(db.Text)

    submitted_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    user = db.relationship('User', backref=db.backref('accommodation_application', uselist=False))
    properties = db.relationship(
        'AccommodationApplicationProperty', backref='application', lazy='dynamic', cascade='all, delete-orphan',
    )

    def to_dict(self, include_documents=False):
        props = self.properties.all()
        d = {
            'id': self.id,
            'user_id': self.user_id,
            'reference': self.reference,
            'room_type': self.room_type,
            'special_requirements': self.special_requirements,
            'has_proof_of_registration': bool(self.proof_of_registration),
            'has_bank_statement': bool(self.bank_statement),
            'has_nsfas_letter': bool(self.nsfas_letter),
            'submitted_at': self.submitted_at.isoformat() if self.submitted_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'overall_status': _overall_status([p.status for p in props]),
            'properties': [p.to_dict() for p in props],
        }
        if include_documents:
            d['proof_of_registration'] = self.proof_of_registration
            d['bank_statement'] = self.bank_statement
            d['nsfas_letter'] = self.nsfas_letter
        return d


class AccommodationApplicationProperty(db.Model):
    """One row per property the student selected (up to 3) — the unit of
    review. A property admin only ever reads/writes their own row."""
    __tablename__ = 'accommodation_application_property'

    id = db.Column(db.Integer, primary_key=True)
    accommodation_application_id = db.Column(
        db.Integer, db.ForeignKey('accommodation_application.id'), nullable=False, index=True,
    )
    property_id = db.Column(db.Integer, db.ForeignKey('property.id'), nullable=False, index=True)

    status = db.Column(db.String(20), default='pending', nullable=False)
    admin_notes = db.Column(db.Text)
    reviewed_by_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    reviewed_at = db.Column(db.DateTime(timezone=True), nullable=True)

    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)

    __table_args__ = (
        db.UniqueConstraint('accommodation_application_id', 'property_id', name='uq_accommodation_application_property'),
    )

    property = db.relationship('Property')
    reviewed_by = db.relationship('User', foreign_keys=[reviewed_by_user_id])

    def to_dict(self):
        return {
            'id': self.id,
            'accommodation_application_id': self.accommodation_application_id,
            'property_id': self.property_id,
            'property_name': self.property.name if self.property else None,
            'status': self.status,
            'admin_notes': self.admin_notes,
            'reviewed_by_user_id': self.reviewed_by_user_id,
            'reviewed_by_name': self.reviewed_by.name if self.reviewed_by else None,
            'reviewed_at': self.reviewed_at.isoformat() if self.reviewed_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
