"""
Seed script for oneApplyHub.

Usage (from backend/):
    FLASK_ENV=development python seed.py [--reset] [--dry-run]

Options:
    --reset     Delete ALL existing properties before seeding (use with care).
    --dry-run   Show what would be inserted/updated without writing to DB.
"""
import json
import os
import sys

import click

# ---------------------------------------------------------------------------
# Bootstrap the Flask app (reads .env automatically via python-dotenv)
# ---------------------------------------------------------------------------
os.environ.setdefault('FLASK_ENV', 'development')

from dotenv import load_dotenv
load_dotenv()

from app import create_app, db  # noqa: E402  (must come after env setup)
from app.models import Property  # noqa: E402

DATA_FILE = os.path.join(os.path.dirname(__file__), 'data', 'properties.json')


def _load_data() -> list[dict]:
    with open(DATA_FILE, encoding='utf-8') as f:
        records = json.load(f)

    cleaned = []
    seen_names = set()
    for rec in records:
        name = rec.get('name', '').strip()
        if not name:
            click.echo(f'  [SKIP] Record with no name: {rec}', err=True)
            continue
        if name in seen_names:
            click.echo(f'  [SKIP] Duplicate name in JSON: "{name}"', err=True)
            continue
        seen_names.add(name)

        # Amenities may be stored as an array in JSON — serialize for the DB
        amenities = rec.get('amenities')
        if isinstance(amenities, list):
            rec['amenities'] = json.dumps(amenities)

        cleaned.append(rec)

    return cleaned


@click.command()
@click.option('--reset', is_flag=True, default=False,
              help='Delete all existing properties before seeding.')
@click.option('--dry-run', is_flag=True, default=False,
              help='Preview changes without writing to the database.')
def seed(reset: bool, dry_run: bool):
    """Seed the database with properties from data/properties.json."""
    app = create_app()

    with app.app_context():
        records = _load_data()
        click.echo(f'Loaded {len(records)} properties from {DATA_FILE}')

        if reset:
            if dry_run:
                count = Property.query.count()
                click.echo(f'[dry-run] Would delete {count} existing properties.')
            else:
                count = Property.query.delete()
                db.session.commit()
                click.echo(f'Deleted {count} existing properties.')

        added = 0
        updated = 0
        skipped = 0

        for rec in records:
            name = rec['name']
            existing = Property.query.filter_by(name=name).first()

            if existing:
                if dry_run:
                    click.echo(f'  [dry-run] Would update: {name}')
                    updated += 1
                else:
                    for key, value in rec.items():
                        setattr(existing, key, value)
                    updated += 1
            else:
                if dry_run:
                    click.echo(f'  [dry-run] Would insert: {name}')
                    added += 1
                else:
                    db.session.add(Property(**rec))
                    added += 1

        if not dry_run:
            db.session.commit()

        mode = '[dry-run] ' if dry_run else ''
        click.echo(
            f'\n{mode}Done: {added} added, {updated} updated, {skipped} skipped.\n'
            f'Total properties in DB: '
            f'{Property.query.count() if not dry_run else "N/A (dry run)"}'
        )


if __name__ == '__main__':
    seed()
