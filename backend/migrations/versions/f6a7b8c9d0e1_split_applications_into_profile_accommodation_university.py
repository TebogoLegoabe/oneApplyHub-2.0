"""Split Application into ApplicantProfile + per-property AccommodationApplication + UniversityApplication

Revision ID: f6a7b8c9d0e1
Revises: e5f6a7b8c9d0
Create Date: 2026-08-04 00:00:00.000000

"""
import json

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f6a7b8c9d0e1'
down_revision = 'e5f6a7b8c9d0'
branch_labels = None
depends_on = None


ROOM_TYPE_BACKFILL = {
    'single': 'single',
    'shared': 'double',
    'studio': 'single',
}


def upgrade():
    op.create_table(
        'applicant_profile',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('user.id'), nullable=False, unique=True),
        sa.Column('first_name', sa.String(length=100), nullable=False),
        sa.Column('last_name', sa.String(length=100), nullable=False),
        sa.Column('id_number', sa.String(length=20)),
        sa.Column('phone_number', sa.String(length=30)),
        sa.Column('nationality', sa.String(length=100)),
        sa.Column('student_number', sa.String(length=50)),
        sa.Column('faculty', sa.String(length=100)),
        sa.Column('year_of_study', sa.String(length=20)),
        sa.Column('degree_program', sa.String(length=150)),
        sa.Column('financial_aid', sa.String(length=50)),
        sa.Column('nsfas_applicant', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('parent_guardian_name', sa.String(length=150)),
        sa.Column('parent_guardian_id_number', sa.String(length=20)),
        sa.Column('parent_guardian_phone', sa.String(length=30)),
        sa.Column('parent_guardian_email', sa.String(length=120)),
        sa.Column('student_id_document', sa.Text()),
        sa.Column('parent_guardian_id_document', sa.Text()),
        sa.Column('grade11_results_document', sa.Text()),
        sa.Column('grade12_june_results_document', sa.Text()),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True)),
    )

    op.create_table(
        'academic_result',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('applicant_profile_id', sa.Integer(), sa.ForeignKey('applicant_profile.id'), nullable=False),
        sa.Column('grade', sa.String(length=20), nullable=False),
        sa.Column('subject', sa.String(length=100), nullable=False),
        sa.Column('mark', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_academic_result_applicant_profile_id', 'academic_result', ['applicant_profile_id'])

    op.create_table(
        'accommodation_application',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('user.id'), nullable=False, unique=True),
        sa.Column('reference', sa.String(length=20), nullable=False, unique=True),
        sa.Column('room_type', sa.String(length=20)),
        sa.Column('special_requirements', sa.Text()),
        sa.Column('proof_of_registration', sa.Text()),
        sa.Column('bank_statement', sa.Text()),
        sa.Column('nsfas_letter', sa.Text()),
        sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True)),
    )

    op.create_table(
        'accommodation_application_property',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('accommodation_application_id', sa.Integer(), sa.ForeignKey('accommodation_application.id'), nullable=False),
        sa.Column('property_id', sa.Integer(), sa.ForeignKey('property.id'), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='pending'),
        sa.Column('admin_notes', sa.Text()),
        sa.Column('reviewed_by_user_id', sa.Integer(), sa.ForeignKey('user.id'), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint('accommodation_application_id', 'property_id', name='uq_accommodation_application_property'),
    )
    op.create_index('ix_aap_accommodation_application_id', 'accommodation_application_property', ['accommodation_application_id'])
    op.create_index('ix_accommodation_application_property_property_id', 'accommodation_application_property', ['property_id'])

    op.create_table(
        'university_application',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('user.id'), nullable=False, unique=True),
        sa.Column('reference', sa.String(length=20), nullable=False, unique=True),
        sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True)),
    )

    op.create_table(
        'university_application_choice',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('university_application_id', sa.Integer(), sa.ForeignKey('university_application.id'), nullable=False),
        sa.Column('university', sa.String(length=150), nullable=False),
        sa.Column('programme', sa.String(length=150)),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='pending'),
        sa.Column('admin_notes', sa.Text()),
        sa.Column('reviewed_by_user_id', sa.Integer(), sa.ForeignKey('user.id'), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_university_application_choice_university_application_id', 'university_application_choice', ['university_application_id'])

    _backfill_from_old_applications()


def _backfill_from_old_applications():
    """Best-effort migration of existing `application` rows into the new
    tables. The old table only ever had one shared status for up to 3
    selected properties — that status is copied onto every resulting
    AccommodationApplicationProperty row, since there's no way to know
    retroactively which property actually made which call."""
    bind = op.get_bind()

    application = sa.table(
        'application',
        sa.column('id', sa.Integer()),
        sa.column('user_id', sa.Integer()),
        sa.column('reference', sa.String()),
        sa.column('form_data', sa.Text()),
        sa.column('status', sa.String()),
        sa.column('admin_notes', sa.Text()),
        sa.column('submitted_at', sa.DateTime()),
        sa.column('updated_at', sa.DateTime()),
    )
    property_table = sa.table('property', sa.column('id', sa.Integer()))

    existing_property_ids = {row[0] for row in bind.execute(sa.select(property_table.c.id))}

    rows = bind.execute(sa.select(
        application.c.id, application.c.user_id, application.c.reference, application.c.form_data,
        application.c.status, application.c.admin_notes, application.c.submitted_at, application.c.updated_at,
    )).fetchall()

    for row in rows:
        try:
            data = json.loads(row.form_data or '{}')
        except Exception:
            data = {}

        bind.execute(sa.text('''
            INSERT INTO applicant_profile (
                user_id, first_name, last_name, id_number, phone_number, nationality,
                student_number, faculty, year_of_study, degree_program, financial_aid, nsfas_applicant,
                parent_guardian_name, parent_guardian_id_number, parent_guardian_phone, parent_guardian_email,
                created_at, updated_at
            ) VALUES (
                :user_id, :first_name, :last_name, :id_number, :phone_number, :nationality,
                :student_number, :faculty, :year_of_study, :degree_program, :financial_aid, :nsfas_applicant,
                :parent_guardian_name, :parent_guardian_id_number, :parent_guardian_phone, :parent_guardian_email,
                :submitted_at, :updated_at
            )
        '''), {
            'user_id': row.user_id,
            'first_name': data.get('firstName') or '',
            'last_name': data.get('lastName') or '',
            'id_number': data.get('idNumber'),
            'phone_number': data.get('phoneNumber'),
            'nationality': data.get('nationality'),
            'student_number': data.get('studentNumber'),
            'faculty': data.get('faculty'),
            'year_of_study': data.get('yearOfStudy'),
            'degree_program': data.get('degreeProgram'),
            'financial_aid': data.get('financialAid'),
            'nsfas_applicant': bool(data.get('nsfasApplicant', False)),
            'parent_guardian_name': data.get('parentGuardianName'),
            'parent_guardian_id_number': data.get('parentGuardianIdNumber'),
            'parent_guardian_phone': data.get('parentGuardianPhone'),
            'parent_guardian_email': data.get('parentGuardianEmail'),
            'submitted_at': row.submitted_at,
            'updated_at': row.updated_at,
        })

        accommodation_id = bind.execute(sa.text('''
            INSERT INTO accommodation_application (
                user_id, reference, room_type, special_requirements, submitted_at, updated_at
            ) VALUES (
                :user_id, :reference, :room_type, :special_requirements, :submitted_at, :updated_at
            ) RETURNING id
        '''), {
            'user_id': row.user_id,
            'reference': row.reference,
            'room_type': ROOM_TYPE_BACKFILL.get(data.get('roomType')),
            'special_requirements': data.get('specialRequirements'),
            'submitted_at': row.submitted_at,
            'updated_at': row.updated_at,
        }).scalar()

        selected = data.get('selectedResidences') or data.get('selected_residences') or []
        for raw_property_id in selected:
            try:
                property_id = int(raw_property_id)
            except (TypeError, ValueError):
                continue
            if property_id not in existing_property_ids:
                continue
            bind.execute(sa.text('''
                INSERT INTO accommodation_application_property (
                    accommodation_application_id, property_id, status, admin_notes, created_at
                ) VALUES (
                    :accommodation_application_id, :property_id, :status, :admin_notes, :created_at
                )
                ON CONFLICT (accommodation_application_id, property_id) DO NOTHING
            '''), {
                'accommodation_application_id': accommodation_id,
                'property_id': property_id,
                'status': row.status or 'pending',
                'admin_notes': row.admin_notes,
                'created_at': row.submitted_at,
            })


def downgrade():
    op.drop_table('university_application_choice')
    op.drop_table('university_application')
    op.drop_table('accommodation_application_property')
    op.drop_table('accommodation_application')
    op.drop_table('academic_result')
    op.drop_table('applicant_profile')
