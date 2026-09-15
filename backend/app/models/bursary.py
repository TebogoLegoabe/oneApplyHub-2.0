import json

from app import db
from app.utils import utcnow


class Bursary(db.Model):
    __tablename__ = 'bursary'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    provider = db.Column(db.String(200), nullable=False)
    funder = db.Column(db.String(50), nullable=False)  # government, corporate, private, professional, international
    field = db.Column(db.String(50), nullable=False)   # engineering, it, health, business, ...
    amount = db.Column(db.String(200))                 # display string, e.g. "R90 000 - R180 000 per year"
    amount_value = db.Column(db.Integer)                # numeric value for sorting/filtering, 0 if not fixed
    deadline = db.Column(db.Date)
    level = db.Column(db.Text)          # JSON array string, e.g. '["undergraduate"]'
    university = db.Column(db.String(50))  # 'all', 'wits', 'uj'
    description = db.Column(db.Text)
    requirements = db.Column(db.Text)   # JSON array string
    application_url = db.Column(db.String(500))
    status = db.Column(db.String(20), default='Open', nullable=False)  # Open, Closed
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'title': self.title,
            'provider': self.provider,
            'funder': self.funder,
            'field': self.field,
            'amount': self.amount,
            'amountValue': self.amount_value,
            'deadline': self.deadline.isoformat() if self.deadline else None,
            'level': json.loads(self.level) if self.level else [],
            'university': self.university,
            'description': self.description,
            'requirements': json.loads(self.requirements) if self.requirements else [],
            'applicationUrl': self.application_url,
            'status': self.status,
        }
