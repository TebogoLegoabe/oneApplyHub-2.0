"""Add opportunity table

Revision ID: 8f9a0b1c2d3e
Revises: 79e0ddb5bb66
Create Date: 2026-08-20 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '8f9a0b1c2d3e'
down_revision = '79e0ddb5bb66'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('opportunity',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('title', sa.String(length=200), nullable=False),
    sa.Column('provider', sa.String(length=150), nullable=False),
    sa.Column('opportunity_type', sa.String(length=50), nullable=False),
    sa.Column('location', sa.String(length=150), nullable=True),
    sa.Column('duration', sa.String(length=100), nullable=True),
    sa.Column('field', sa.String(length=100), nullable=True),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('requirements', sa.Text(), nullable=True),
    sa.Column('salary_range', sa.String(length=100), nullable=True),
    sa.Column('application_url', sa.String(length=500), nullable=False),
    sa.Column('deadline', sa.DateTime(timezone=True), nullable=True),
    sa.Column('status', sa.String(length=20), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )


def downgrade():
    op.drop_table('opportunity')
