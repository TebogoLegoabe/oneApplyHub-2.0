import json
from app import db
from app.utils import utcnow

OPPORTUNITY_TYPE_INTERNSHIP = 'internship'
OPPORTUNITY_TYPE_GRADUATE = 'graduate'
VALID_OPPORTUNITY_TYPES = (OPPORTUNITY_TYPE_INTERNSHIP, OPPORTUNITY_TYPE_GRADUATE)


class Opportunity(db.Model):
    __tablename__ = 'opportunity'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    provider = db.Column(db.String(150), nullable=False)
    opportunity_type = db.Column(db.String(50), nullable=False)
    location = db.Column(db.String(150))
    duration = db.Column(db.String(100))
    field = db.Column(db.String(100))
    description = db.Column(db.Text)
    requirements = db.Column(db.Text)
    salary_range = db.Column(db.String(100))
    application_url = db.Column(db.String(500), nullable=False)
    deadline = db.Column(db.DateTime(timezone=True))
    status = db.Column(db.String(20), default='open', nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'provider': self.provider,
            'opportunity_type': self.opportunity_type,
            'location': self.location,
            'duration': self.duration,
            'field': self.field,
            'description': self.description,
            'requirements': self.requirements,
            'salary_range': self.salary_range,
            'application_url': self.application_url,
            'deadline': self.deadline.isoformat() if self.deadline else None,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
