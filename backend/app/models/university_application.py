from app import db
from app.utils import utcnow
from app.models.accommodation_application import _overall_status

VALID_STATUSES = ('pending', 'under_review', 'approved', 'rejected')


class UniversityApplication(db.Model):
    """The shared university submission — one per student. No per-institution
    admin login exists (there's no API relationship with universities), so
    this is an internal ops tracking queue for manual submission, not a
    property-admin-style review workflow."""
    __tablename__ = 'university_application'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, unique=True)
    reference = db.Column(db.String(20), unique=True, nullable=False)

    submitted_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    user = db.relationship('User', backref=db.backref('university_application', uselist=False))
    choices = db.relationship(
        'UniversityApplicationChoice', backref='application', lazy='dynamic', cascade='all, delete-orphan',
        order_by='UniversityApplicationChoice.id',
    )

    def to_dict(self):
        choices = self.choices.all()
        return {
            'id': self.id,
            'user_id': self.user_id,
            'reference': self.reference,
            'submitted_at': self.submitted_at.isoformat() if self.submitted_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'overall_status': _overall_status([c.status for c in choices]),
            'choices': [c.to_dict() for c in choices],
        }


class UniversityApplicationChoice(db.Model):
    """One row per university + programme the student is applying to (up to 3)."""
    __tablename__ = 'university_application_choice'

    id = db.Column(db.Integer, primary_key=True)
    university_application_id = db.Column(
        db.Integer, db.ForeignKey('university_application.id'), nullable=False, index=True,
    )
    university = db.Column(db.String(150), nullable=False)
    programme = db.Column(db.String(150))

    status = db.Column(db.String(20), default='pending', nullable=False)
    admin_notes = db.Column(db.Text)
    reviewed_by_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    reviewed_at = db.Column(db.DateTime(timezone=True), nullable=True)

    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)

    reviewed_by = db.relationship('User', foreign_keys=[reviewed_by_user_id])

    def to_dict(self):
        return {
            'id': self.id,
            'university_application_id': self.university_application_id,
            'university': self.university,
            'programme': self.programme,
            'status': self.status,
            'admin_notes': self.admin_notes,
            'reviewed_by_user_id': self.reviewed_by_user_id,
            'reviewed_by_name': self.reviewed_by.name if self.reviewed_by else None,
            'reviewed_at': self.reviewed_at.isoformat() if self.reviewed_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
