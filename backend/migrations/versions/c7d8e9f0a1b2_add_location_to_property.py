"""Add map location (latitude, longitude, geo_precision) to Property

Revision ID: c7d8e9f0a1b2
Revises: 8f9a0b1c2d3e
Create Date: 2026-11-27 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c7d8e9f0a1b2'
down_revision = '8f9a0b1c2d3e'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('property', schema=None) as batch_op:
        batch_op.add_column(sa.Column('latitude', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('longitude', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('geo_precision', sa.String(length=20), nullable=True))


def downgrade():
    with op.batch_alter_table('property', schema=None) as batch_op:
        batch_op.drop_column('geo_precision')
        batch_op.drop_column('longitude')
        batch_op.drop_column('latitude')
