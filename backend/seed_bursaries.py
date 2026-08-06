"""
Seed script for oneApplyHub bursaries.

Usage (from backend/):
    FLASK_ENV=development python seed_bursaries.py [--reset] [--dry-run]

Options:
    --reset     Delete ALL existing bursaries before seeding (use with care).
    --dry-run   Show what would be inserted/updated without writing to DB.
"""
import json
import os
from datetime import date

import click

os.environ.setdefault('FLASK_ENV', 'development')

from dotenv import load_dotenv
load_dotenv()

from app import create_app, db  # noqa: E402  (must come after env setup)
from app.models import Bursary  # noqa: E402

DATA_FILE = os.path.join(os.path.dirname(__file__), 'data', 'bursaries.json')


def _load_data() -> list[dict]:
    with open(DATA_FILE, encoding='utf-8') as f:
        records = json.load(f)

    cleaned = []
    seen_titles = set()
    for rec in records:
        title = rec.get('title', '').strip()
        if not title:
            click.echo(f'  [SKIP] Record with no title: {rec}', err=True)
            continue
        if title in seen_titles:
            click.echo(f'  [SKIP] Duplicate title in JSON: "{title}"', err=True)
            continue
        seen_titles.add(title)

        row = {
            'title': title,
            'provider': rec.get('provider'),
            'funder': rec.get('funder'),
            'field': rec.get('field'),
            'amount': rec.get('amount'),
            'amount_value': rec.get('amountValue'),
            'deadline': date.fromisoformat(rec['deadline']) if rec.get('deadline') else None,
            'level': json.dumps(rec.get('level', [])),
            'university': rec.get('university'),
            'description': rec.get('description'),
            'requirements': json.dumps(rec.get('requirements', [])),
            'application_url': rec.get('applicationUrl'),
            'status': rec.get('status', 'Open'),
        }
        cleaned.append(row)

    return cleaned


@click.command()
@click.option('--reset', is_flag=True, default=False,
              help='Delete all existing bursaries before seeding.')
@click.option('--dry-run', is_flag=True, default=False,
              help='Preview changes without writing to the database.')
def seed(reset: bool, dry_run: bool):
    """Seed the database with bursaries from data/bursaries.json."""
    app = create_app()

    with app.app_context():
        records = _load_data()
        click.echo(f'Loaded {len(records)} bursaries from {DATA_FILE}')

        if reset:
            if dry_run:
                count = Bursary.query.count()
                click.echo(f'[dry-run] Would delete {count} existing bursaries.')
            else:
                count = Bursary.query.delete()
                db.session.commit()
                click.echo(f'Deleted {count} existing bursaries.')

        added = 0
        updated = 0

        for rec in records:
            title = rec['title']
            existing = Bursary.query.filter_by(title=title).first()

            if existing:
                if dry_run:
                    click.echo(f'  [dry-run] Would update: {title}')
                    updated += 1
                else:
                    for key, value in rec.items():
                        setattr(existing, key, value)
                    updated += 1
            else:
                if dry_run:
                    click.echo(f'  [dry-run] Would insert: {title}')
                    added += 1
                else:
                    db.session.add(Bursary(**rec))
                    added += 1

        if not dry_run:
            db.session.commit()

        mode = '[dry-run] ' if dry_run else ''
        click.echo(
            f'\n{mode}Done: {added} added, {updated} updated.\n'
            f'Total bursaries in DB: '
            f'{Bursary.query.count() if not dry_run else "N/A (dry run)"}'
        )


if __name__ == '__main__':
    seed()
