"""Add must_change_password to User

Revision ID: e5f6a7b8c9d0
Revises: d4e5f6a7b8c9
Create Date: 2026-08-04 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e5f6a7b8c9d0'
down_revision = 'd4e5f6a7b8c9'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.add_column(sa.Column('must_change_password', sa.Boolean(), nullable=True))
    op.execute('UPDATE "user" SET must_change_password = false WHERE must_change_password IS NULL')
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.alter_column('must_change_password', nullable=False, server_default=sa.false())


def downgrade():
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.drop_column('must_change_password')
