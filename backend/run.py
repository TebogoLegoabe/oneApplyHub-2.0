import os
from dotenv import load_dotenv
load_dotenv()  # Load .env before create_app() reads environment variables

from app import create_app

app = create_app()

@app.route('/')
def home():
    return {'message': 'StudentStay API is running!', 'status': 'success'}

# Temporary route to populate Railway database
@app.route('/setup-database')
def setup_database():
    try:
        # Import here to avoid circular imports
        from add_sample_properties import add_sample_properties
        
        with app.app_context():
            add_sample_properties()
            
        return {
            'message': 'Database setup complete!', 
            'status': 'success',
            'properties_added': 52
        }
    except Exception as e:
        return {'error': str(e), 'status': 'failed'}, 500

def _ensure_database_initialized():
    """Create tables and stamp Alembic on a brand-new database.

    The migration history only contains incremental changes on top of an
    already-existing schema (there's no baseline migration), so a fresh
    database needs `db.create_all()` once before `flask db upgrade` will
    have anything to apply cleanly. This only runs for local dev via
    `python run.py` — production deploys run `flask db upgrade` directly
    (see railway.json) against an already-initialized database, so this
    is a no-op there.
    """
    from sqlalchemy import inspect
    from app import db

    with app.app_context():
        if 'user' not in inspect(db.engine).get_table_names():
            print('No tables found - creating database schema for the first time...')
            db.create_all()
            from flask_migrate import stamp
            stamp()


if __name__ == '__main__':
    _ensure_database_initialized()

    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)