"""
Seed script: attach a primary photo to properties, sourced from
data/property_images.json (name -> image_url, verified real photos taken
from each property's own website).

Usage (from backend/):
    FLASK_ENV=development python seed_property_images.py [--dry-run]

Idempotent: if a property already has a primary image, it is left alone
rather than duplicated or overwritten.
"""
import json
import os

import click

os.environ.setdefault('FLASK_ENV', 'development')

from dotenv import load_dotenv
load_dotenv()

from app import create_app, db  # noqa: E402
from app.models import Property, PropertyImage  # noqa: E402

DATA_FILE = os.path.join(os.path.dirname(__file__), 'data', 'property_images.json')


@click.command()
@click.option('--dry-run', is_flag=True, default=False, help='Preview changes without writing to the database.')
def seed(dry_run: bool):
    app = create_app()
    with app.app_context():
        with open(DATA_FILE, encoding='utf-8') as f:
            records = json.load(f)
        click.echo(f'Loaded {len(records)} image candidates from {DATA_FILE}')

        added, skipped, not_found = 0, 0, []
        for rec in records:
            prop = Property.query.filter_by(name=rec['name']).first()
            if not prop:
                not_found.append(rec['name'])
                continue
            existing_primary = PropertyImage.query.filter_by(property_id=prop.id, is_primary=True).first()
            if existing_primary:
                skipped += 1
                continue
            if dry_run:
                click.echo(f'  [dry-run] Would add primary image for: {rec["name"]}')
                added += 1
            else:
                db.session.add(PropertyImage(property_id=prop.id, image_url=rec['image_url'], is_primary=True))
                added += 1

        if not dry_run:
            db.session.commit()

        mode = '[dry-run] ' if dry_run else ''
        click.echo(f'\n{mode}Done: {added} added, {skipped} skipped (already had a primary image).')
        if not_found:
            click.echo(f'Not found in DB ({len(not_found)}):')
            for n in not_found:
                click.echo(f'  - {n}')


if __name__ == '__main__':
    seed()
