from app import db
from app.utils import utcnow


class PropertyAdmin(db.Model):
    __tablename__ = 'property_admin'

    id = db.Column(db.Integer, primary_key=True)
    property_id = db.Column(db.Integer, db.ForeignKey('property.id'), nullable=False, index=True)
    admin_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, index=True)
    assigned_by_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)

    __table_args__ = (
        db.UniqueConstraint('property_id', 'admin_user_id', name='uq_property_admin_assignment'),
    )

    property = db.relationship('Property', backref=db.backref('admin_assignments', lazy='dynamic'))
    admin = db.relationship('User', foreign_keys=[admin_user_id], backref=db.backref('managed_property_assignments', lazy='dynamic'))
    assigned_by = db.relationship('User', foreign_keys=[assigned_by_user_id])

    def to_dict(self):
        return {
            'id': self.id,
            'property_id': self.property_id,
            'property_name': self.property.name if self.property else None,
            'admin_user_id': self.admin_user_id,
            'admin_name': self.admin.name if self.admin else None,
            'admin_email': self.admin.email if self.admin else None,
            'assigned_by_user_id': self.assigned_by_user_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
