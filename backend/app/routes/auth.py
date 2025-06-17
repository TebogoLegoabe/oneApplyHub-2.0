from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db
from app.models import User
import re

auth_bp = Blueprint('auth', __name__)

def is_valid_university_email(email):
    """Check if email is from Wits or UJ with proper student number format"""
    valid_domains = ['students.wits.ac.za', 'student.uj.ac.za']
    
    if '@' not in email:
        return False
    
    local_part, domain = email.split('@', 1)
    
    if domain not in valid_domains:
        return False
    
    # Check if local part is a student number (digits only, typically 6-10 digits)
    if not re.match(r'^\d{6,10}$', local_part):
        return False
    
    return True

@auth_bp.route('/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Missing email or password'}), 400
        
        email = data['email'].strip().lower()
        user = User.query.filter_by(email=email).first()
        
        if user and user.check_password(data['password']):
            # Create JWT token with proper subject (sub) field
            access_token = create_access_token(
                identity=str(user.id),  # Convert to string
                additional_claims={'sub': str(user.id)}  # Add subject explicitly
            )
            return jsonify({
                'access_token': access_token,
                'user': user.to_dict()
            }), 200
        
        return jsonify({'error': 'Invalid credentials'}), 401
        
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({'error': 'Login failed'}), 500

@auth_bp.route('/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.get_json()
        print(f"Register attempt with data: {data}")
        
        # Validation
        if not data.get('email') or not data.get('password') or not data.get('name'):
            return jsonify({'error': 'Missing required fields'}), 400
        
        email = data['email'].strip().lower()
        
        if not is_valid_university_email(email):
            return jsonify({
                'error': 'Please use your university email with your student number (e.g., 2307134@students.wits.ac.za)'
            }), 400
        
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already registered'}), 400
        
        # Determine university from email
        university = 'wits' if 'wits' in email else 'uj'
        
        # Create user
        user = User(
            email=email,
            name=data['name'],
            university=university,
            year_of_study=data.get('year_of_study'),
            faculty=data.get('faculty'),
            verified=True  # Auto-verify for testing
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({'message': 'Registration successful.'}), 201
        
    except Exception as e:
        print(f"Registration error: {e}")
        return jsonify({'error': 'Registration failed'}), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({'user': user.to_dict()}), 200
        
    except Exception as e:
        print(f"Profile error: {e}")
        return jsonify({'error': 'Failed to get profile'}), 500