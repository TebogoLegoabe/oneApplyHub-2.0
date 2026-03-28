"""Add approved field to review for admin moderation

Revision ID: a1b2c3d4e5f6
Revises: 4c16224e4129
Create Date: 2026-03-07 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = 'a1b2c3d4e5f6'
down_revision = '4c16224e4129'
branch_labels = None
depends_on = None


def upgrade():
    # Add approved column — existing reviews are already public, so default them to True.
    # New reviews will be set to False (pending) by the Python model default.
    with op.batch_alter_table('review', schema=None) as batch_op:
        batch_op.add_column(
            sa.Column('approved', sa.Boolean(), nullable=False, server_default='1')
        )


def downgrade():
    with op.batch_alter_table('review', schema=None) as batch_op:
        batch_op.drop_column('approved')
