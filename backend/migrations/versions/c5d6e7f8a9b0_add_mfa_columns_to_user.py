"""add MFA columns to user table

Revision ID: c5d6e7f8a9b0
Revises: 4c16224e4129
Create Date: 2026-05-24 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = 'c5d6e7f8a9b0'
down_revision = '4c16224e4129'
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    existing_cols = {c['name'] for c in inspector.get_columns('user')}

    with op.batch_alter_table('user', schema=None) as batch_op:
        if 'mfa_enabled' not in existing_cols:
            batch_op.add_column(sa.Column('mfa_enabled', sa.Boolean(), nullable=False, server_default='0'))
        if 'mfa_secret' not in existing_cols:
            batch_op.add_column(sa.Column('mfa_secret', sa.String(length=64), nullable=True))
        if 'mfa_backup_codes' not in existing_cols:
            batch_op.add_column(sa.Column('mfa_backup_codes', sa.Text(), nullable=True))
        if 'mfa_pending_token' not in existing_cols:
            batch_op.add_column(sa.Column('mfa_pending_token', sa.String(length=100), nullable=True))
        if 'mfa_pending_expires' not in existing_cols:
            batch_op.add_column(sa.Column('mfa_pending_expires', sa.DateTime(timezone=True), nullable=True))

    # Add index on mfa_pending_token if not already present
    existing_indexes = {i['name'] for i in inspector.get_indexes('user')}
    if 'ix_user_mfa_pending_token' not in existing_indexes:
        with op.batch_alter_table('user', schema=None) as batch_op:
            batch_op.create_index('ix_user_mfa_pending_token', ['mfa_pending_token'], unique=False)


def downgrade():
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.drop_index('ix_user_mfa_pending_token')
        batch_op.drop_column('mfa_pending_expires')
        batch_op.drop_column('mfa_pending_token')
        batch_op.drop_column('mfa_backup_codes')
        batch_op.drop_column('mfa_secret')
        batch_op.drop_column('mfa_enabled')
