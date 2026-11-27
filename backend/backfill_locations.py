"""
Backfill map locations for existing properties from data/properties.json.

Safe for production: it only sets latitude / longitude / geo_precision on properties
(matched by exact name) that do not have a pin yet. No other fields are touched, so
edits made in the admin dashboard are preserved. Use --overwrite to replace existing
pins that were *not* placed by an admin (geo_precision != 'exact').

Usage (from backend/, after `flask db upgrade`):
    python backfill_locations.py [--dry-run] [--overwrite]
"""
import json
import os

import click

os.environ.setdefault('FLASK_ENV', 'development')

from dotenv import load_dotenv  # noqa: E402

load_dotenv()

from app import create_app, db  # noqa: E402
from app.models import Property  # noqa: E402

DATA_FILE = os.path.join(os.path.dirname(__file__), 'data', 'properties.json')


@click.command()
@click.option('--dry-run', is_flag=True, default=False, help='Show what would change without writing.')
@click.option('--overwrite', is_flag=True, default=False, help="Also replace geocoded pins (never admin-placed 'exact' pins).")
def backfill(dry_run: bool, overwrite: bool):
    app = create_app()
    with app.app_context():
        with open(DATA_FILE, encoding='utf-8') as handle:
            records = {record['name']: record for record in json.load(handle) if record.get('latitude') is not None}

        updated, skipped, missing = 0, 0, []
        for prop in Property.query.order_by(Property.name).all():
            record = records.get(prop.name)
            if not record:
                if prop.latitude is None:
                    missing.append(prop.name)
                continue
            has_pin = prop.latitude is not None and prop.longitude is not None
            if has_pin and (not overwrite or prop.geo_precision == 'exact'):
                skipped += 1
                continue
            click.echo(f'  {"[dry-run] " if dry_run else ""}{prop.name}: {record["latitude"]}, {record["longitude"]} ({record.get("geo_precision")})')
            if not dry_run:
                prop.latitude = record['latitude']
                prop.longitude = record['longitude']
                prop.geo_precision = record.get('geo_precision')
            updated += 1

        if not dry_run:
            db.session.commit()
        click.echo(f'\n{"[dry-run] " if dry_run else ""}Done: {updated} pinned, {skipped} already had a pin.')
        if missing:
            click.echo(f'{len(missing)} properties still have no pin — set them in the admin dashboard (Properties > Location):')
            for name in missing:
                click.echo(f'  - {name}')


if __name__ == '__main__':
    backfill()
