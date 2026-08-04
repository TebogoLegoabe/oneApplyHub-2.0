"""Add website to Property

Revision ID: d4e5f6a7b8c9
Revises: bb05356c3bac
Create Date: 2026-08-04 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd4e5f6a7b8c9'
down_revision = 'bb05356c3bac'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('property', schema=None) as batch_op:
        batch_op.add_column(sa.Column('website', sa.String(length=500), nullable=True))


def downgrade():
    with op.batch_alter_table('property', schema=None) as batch_op:
        batch_op.drop_column('website')
