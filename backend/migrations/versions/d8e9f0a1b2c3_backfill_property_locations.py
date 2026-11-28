"""Backfill property map locations from data/properties.json

Fills latitude / longitude / geo_precision for existing properties (matched by exact
name) that do not have a pin yet, so deploys get map pins without a manual step.
Pins that are already set — including ones placed by an admin — are never changed.

Revision ID: d8e9f0a1b2c3
Revises: c7d8e9f0a1b2
Create Date: 2026-11-27 00:00:00.000000

"""
import json
import os

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd8e9f0a1b2c3'
down_revision = 'c7d8e9f0a1b2'
branch_labels = None
depends_on = None

DATA_FILE = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'properties.json')

property_table = sa.table(
    'property',
    sa.column('name', sa.String),
    sa.column('latitude', sa.Float),
    sa.column('longitude', sa.Float),
    sa.column('geo_precision', sa.String),
)


def upgrade():
    if not os.path.exists(DATA_FILE):
        return
    with open(DATA_FILE, encoding='utf-8') as handle:
        records = json.load(handle)

    bind = op.get_bind()
    for record in records:
        if record.get('latitude') is None or record.get('longitude') is None:
            continue
        bind.execute(
            property_table.update()
            .where(property_table.c.name == record['name'])
            .where(property_table.c.latitude.is_(None))
            .values(
                latitude=record['latitude'],
                longitude=record['longitude'],
                geo_precision=record.get('geo_precision'),
            )
        )


def downgrade():
    # Data-only migration. Downgrading c7d8e9f0a1b2 removes the columns themselves.
    pass
