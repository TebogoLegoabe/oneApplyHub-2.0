from app import db
from app.utils import utcnow

GRADE_11 = 'grade_11'
GRADE_12_JUNE = 'grade_12_june'
VALID_GRADES = (GRADE_11, GRADE_12_JUNE)


class ApplicantProfile(db.Model):
    """Personal, study, and guardian details filled once and shared by both
    the accommodation and university application tracks."""
    __tablename__ = 'applicant_profile'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, unique=True)

    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    id_number = db.Column(db.String(20))
    phone_number = db.Column(db.String(30))
    nationality = db.Column(db.String(100))

    student_number = db.Column(db.String(50))
    faculty = db.Column(db.String(100))
    year_of_study = db.Column(db.String(20))
    degree_program = db.Column(db.String(150))
    financial_aid = db.Column(db.String(50))
    nsfas_applicant = db.Column(db.Boolean, default=False, nullable=False)

    parent_guardian_name = db.Column(db.String(150))
    parent_guardian_id_number = db.Column(db.String(20))
    parent_guardian_phone = db.Column(db.String(30))
    parent_guardian_email = db.Column(db.String(120))

    # Base64 data URIs — same storage pattern as User.profile_picture_url
    student_id_document = db.Column(db.Text)
    parent_guardian_id_document = db.Column(db.Text)
    grade11_results_document = db.Column(db.Text)
    grade12_june_results_document = db.Column(db.Text)

    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    user = db.relationship('User', backref=db.backref('applicant_profile', uselist=False))
    academic_results = db.relationship(
        'AcademicResult', backref='profile', lazy='dynamic', cascade='all, delete-orphan',
    )

    def to_dict(self, include_documents=False):
        results = self.academic_results.order_by(AcademicResult.grade, AcademicResult.subject).all()
        d = {
            'id': self.id,
            'user_id': self.user_id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'id_number': self.id_number,
            'phone_number': self.phone_number,
            'nationality': self.nationality,
            'student_number': self.student_number,
            'faculty': self.faculty,
            'year_of_study': self.year_of_study,
            'degree_program': self.degree_program,
            'financial_aid': self.financial_aid,
            'nsfas_applicant': self.nsfas_applicant,
            'parent_guardian_name': self.parent_guardian_name,
            'parent_guardian_id_number': self.parent_guardian_id_number,
            'parent_guardian_phone': self.parent_guardian_phone,
            'parent_guardian_email': self.parent_guardian_email,
            'has_student_id_document': bool(self.student_id_document),
            'has_parent_guardian_id_document': bool(self.parent_guardian_id_document),
            'has_grade11_results_document': bool(self.grade11_results_document),
            'has_grade12_june_results_document': bool(self.grade12_june_results_document),
            'academic_results': [r.to_dict() for r in results],
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_documents:
            d['student_id_document'] = self.student_id_document
            d['parent_guardian_id_document'] = self.parent_guardian_id_document
            d['grade11_results_document'] = self.grade11_results_document
            d['grade12_june_results_document'] = self.grade12_june_results_document
        return d


class AcademicResult(db.Model):
    __tablename__ = 'academic_result'

    id = db.Column(db.Integer, primary_key=True)
    applicant_profile_id = db.Column(db.Integer, db.ForeignKey('applicant_profile.id'), nullable=False, index=True)
    grade = db.Column(db.String(20), nullable=False)  # 'grade_11' | 'grade_12_june'
    subject = db.Column(db.String(100), nullable=False)
    mark = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'grade': self.grade,
            'subject': self.subject,
            'mark': self.mark,
        }
