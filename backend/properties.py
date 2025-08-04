from flask import Blueprint, request, jsonify
from app import db
from app.models import Property

properties_bp = Blueprint('properties', __name__)

# Handle both with and without trailing slash
@properties_bp.route('', methods=['GET'])
@properties_bp.route('/', methods=['GET'])
def get_properties():
    try:
        print("=== Properties API Called ===")
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        university = request.args.get('university')
        property_type = request.args.get('type')
        min_price = request.args.get('min_price', type=int)
        max_price = request.args.get('max_price', type=int)
        search = request.args.get('search')
        
        print(f"Filters received: university={university}, type={property_type}")
        
        # Start with approved properties only
        query = Property.query.filter_by(approved=True)
        initial_count = query.count()
        print(f"Initial approved properties: {initial_count}")
        
        # Apply filters
        if university and university != 'all':
            query = query.filter((Property.university == university) | (Property.university == 'both'))
            print(f"After university filter ({university}): {query.count()}")
        
        if property_type and property_type != 'all':
            query = query.filter(Property.property_type == property_type)
            print(f"After type filter ({property_type}): {query.count()}")
        
        if min_price:
            query = query.filter(Property.price_min >= min_price)
        
        if max_price:
            query = query.filter(Property.price_max <= max_price)
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (Property.name.ilike(search_term)) | 
                (Property.address.ilike(search_term))
            )
        
        final_count = query.count()
        print(f"Final query count: {final_count}")
        
        # Get paginated results
        properties = query.paginate(page=page, per_page=per_page, error_out=False)
        
        result = {
            'properties': [prop.to_dict() for prop in properties.items],
            'total': properties.total,
            'pages': properties.pages,
            'current_page': page
        }
        
        print(f"Returning {len(result['properties'])} properties")
        return jsonify(result), 200
        
    except Exception as e:
        print(f"ERROR in get_properties: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@properties_bp.route('/test', methods=['GET'])
def test_route():
    from app.models import Property
    count = Property.query.count()
    return jsonify({
        'message': 'Properties route is working!', 
        'total_properties': count
    }), 200

@properties_bp.route('/debug-db', methods=['GET'])
def debug_database_path():
    from flask import current_app
    import os
    
    try:
        db_uri = current_app.config['SQLALCHEMY_DATABASE_URI']
        
        if 'sqlite:///' in db_uri:
            db_path = db_uri.replace('sqlite:///', '')
            abs_path = os.path.abspath(db_path)
            file_exists = os.path.exists(abs_path)
            file_size = os.path.getsize(abs_path) if file_exists else 0
        else:
            abs_path = "Not SQLite"
            file_exists = False
            file_size = 0
        
        from app.models import Property
        flask_count = Property.query.count()
        
        return jsonify({
            'database_uri': db_uri,
            'absolute_database_path': abs_path,
            'file_exists': file_exists,
            'file_size_bytes': file_size,
            'properties_in_flask': flask_count,
            'flask_working_dir': os.getcwd()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@properties_bp.route('/debug-sql', methods=['GET'])
def debug_sql():
    from app import db
    from app.models import Property
    from sqlalchemy import text
    
    try:
        # Test raw SQL with proper text() wrapper
        result = db.session.execute(text('SELECT COUNT(*) FROM property'))
        raw_count = result.scalar()
        
        # Test SQLAlchemy query
        sqlalchemy_count = Property.query.count()
        
        # Test approved properties specifically - FIX: Use correct variable
        approved_result = db.session.execute(text('SELECT COUNT(*) FROM property WHERE approved = 1'))
        approved_count = approved_result.scalar()  # FIXED: was using 'result' instead of 'approved_result'
        
        # Test SQLAlchemy approved query
        sqlalchemy_approved = Property.query.filter_by(approved=True).count()
        
        # Check table structure
        tables_result = db.session.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
        tables = [row[0] for row in tables_result]
        
        return jsonify({
            'raw_sql_total_count': raw_count,
            'raw_sql_approved_count': approved_count,
            'sqlalchemy_total_count': sqlalchemy_count,
            'sqlalchemy_approved_count': sqlalchemy_approved,
            'tables_in_database': tables
        }), 200
        
    except Exception as e:
        import traceback
        return jsonify({
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@properties_bp.route('/debug-fresh', methods=['GET'])
def debug_fresh():
    from app import db
    from app.models import Property
    
    try:
        # Force a fresh session
        db.session.close()
        
        # Try the query again
        count = Property.query.count()
        approved_count = Property.query.filter_by(approved=True).count()
        
        # Try to get first property
        first_prop = Property.query.first()
        first_name = first_prop.name if first_prop else "None"
        
        return jsonify({
            'total_properties': count,
            'approved_properties': approved_count,
            'first_property_name': first_name,
            'session_refreshed': True
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@properties_bp.route('/debug-raw-inspect', methods=['GET'])
def debug_raw_inspect():
    from app import db
    from sqlalchemy import text
    import os
    
    try:
        # Get the exact database path Flask is using
        db_uri = db.engine.url.database
        abs_path = os.path.abspath(db_uri) if db_uri else "Unknown"
        
        # Check file details
        file_exists = os.path.exists(abs_path)
        file_size = os.path.getsize(abs_path) if file_exists else 0
        
        # Raw SQL queries with explicit connection
        with db.engine.connect() as conn:
            # Check all tables
            tables = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table'")).fetchall()
            
            # Check property table schema
            schema = conn.execute(text("PRAGMA table_info(property)")).fetchall()
            
            # Try to get raw property data
            properties = conn.execute(text("SELECT id, name, approved FROM property LIMIT 5")).fetchall()
            
            # Check if there are any rows at all
            total_rows = conn.execute(text("SELECT COUNT(*) FROM property")).scalar()
            
        return jsonify({
            'flask_db_path': abs_path,
            'file_exists': file_exists,
            'file_size': file_size,
            'tables': [t[0] for t in tables],
            'property_schema': [{'name': col[1], 'type': col[2]} for col in schema],
            'total_property_rows': total_rows,
            'sample_properties': [{'id': p[0], 'name': p[1], 'approved': p[2]} for p in properties]
        }), 200
        
    except Exception as e:
        import traceback
        return jsonify({
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500
    
@properties_bp.route('/debug-commit', methods=['GET'])
def debug_commit():
    from app import db
    from app.models import Property
    
    try:
        # Force commit any pending transactions
        db.session.commit()
        
        # Try query again
        count_after_commit = Property.query.count()
        
        return jsonify({
            'committed': True,
            'count_after_commit': count_after_commit
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@properties_bp.route('/<int:property_id>', methods=['GET'])
def get_property(property_id):
    try:
        property = Property.query.get_or_404(property_id)
        
        if not property.approved:
            return jsonify({'error': 'Property not found'}), 404
        
        return jsonify({'property': property.to_dict()}), 200
        
    except Exception as e:
        print(f"Error fetching property {property_id}: {e}")
        return jsonify({'error': 'Property not found'}), 404