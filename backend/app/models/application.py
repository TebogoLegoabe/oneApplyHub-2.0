import json
import random
import string

from app import db
from app.utils import utcnow


def _gen_reference():
    chars = string.ascii_uppercase + string.digits
    return 'APP-' + ''.join(random.choices(chars, k=8))


class Application(db.Model):
    __tablename__ = 'application'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, unique=True)
    reference = db.Column(db.String(20), unique=True, nullable=False)

    # Key columns for search/display without parsing JSON
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    university = db.Column(db.String(50))
    student_number = db.Column(db.String(50))

    # Full form payload stored as JSON
    form_data = db.Column(db.Text, nullable=False)

    # Workflow: pending → under_review → approved | rejected
    status = db.Column(db.String(20), default='pending', nullable=False)
    admin_notes = db.Column(db.Text)

    submitted_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), default=utcnow)

    user = db.relationship('User', backref=db.backref('application', uselist=False))

    def to_dict(self, include_form_data=False):
        d = {
            'id': self.id,
            'reference': self.reference,
            'user_id': self.user_id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'university': self.university,
            'student_number': self.student_number,
            'status': self.status,
            'admin_notes': self.admin_notes,
            'submitted_at': self.submitted_at.isoformat() if self.submitted_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_form_data:
            try:
                d['form_data'] = json.loads(self.form_data) if self.form_data else {}
            except Exception:
                d['form_data'] = {}
        return d
