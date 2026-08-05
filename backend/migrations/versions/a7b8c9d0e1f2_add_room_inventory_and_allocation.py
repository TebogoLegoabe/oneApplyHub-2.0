"""Add Floor, Room, and RoomAllocation for per-property room inventory

Revision ID: a7b8c9d0e1f2
Revises: f6a7b8c9d0e1
Create Date: 2026-08-04 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a7b8c9d0e1f2'
down_revision = 'f6a7b8c9d0e1'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'floor',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('property_id', sa.Integer(), sa.ForeignKey('property.id'), nullable=False),
        sa.Column('floor_number', sa.Integer(), nullable=False),
        sa.Column('label', sa.String(length=100)),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint('property_id', 'floor_number', name='uq_floor_property_number'),
    )
    op.create_index('ix_floor_property_id', 'floor', ['property_id'])

    op.create_table(
        'room',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('property_id', sa.Integer(), sa.ForeignKey('property.id'), nullable=False),
        sa.Column('floor_id', sa.Integer(), sa.ForeignKey('floor.id'), nullable=False),
        sa.Column('room_number', sa.String(length=20), nullable=False),
        sa.Column('room_type', sa.String(length=20), nullable=False),
        sa.Column('capacity', sa.Integer(), nullable=False),
        sa.Column('price', sa.Integer()),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint('property_id', 'room_number', name='uq_room_property_number'),
    )
    op.create_index('ix_room_property_id', 'room', ['property_id'])
    op.create_index('ix_room_floor_id', 'room', ['floor_id'])

    op.create_table(
        'room_allocation',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('room_id', sa.Integer(), sa.ForeignKey('room.id'), nullable=False),
        sa.Column('accommodation_application_property_id', sa.Integer(), sa.ForeignKey('accommodation_application_property.id'), nullable=False),
        sa.Column('allocated_by_user_id', sa.Integer(), sa.ForeignKey('user.id'), nullable=True),
        sa.Column('allocated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('vacated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='active'),
    )
    op.create_index('ix_room_allocation_room_id', 'room_allocation', ['room_id'])
    op.create_index('ix_room_allocation_accommodation_application_property_id', 'room_allocation', ['accommodation_application_property_id'])


def downgrade():
    op.drop_table('room_allocation')
    op.drop_table('room')
    op.drop_table('floor')
