from app import create_app
import os

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

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)