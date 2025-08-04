from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db,mail
from app.models import User
from flask_mail import Message
import re
import jwt
from flask_cors import CORS
from datetime import datetime, timedelta
from itsdangerous import URLSafeTimedSerializer


auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


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
def generate_serializer():
    secret_key = 'dev-secret-key-change-in-production'  # Same as your app.config['SECRET_KEY']
    return URLSafeTimedSerializer(secret_key)
@auth_bp.route('/reset-password', methods=['POST'])
def send_reset_email():
    data = request.get_json()
    email = data.get('email')
    print(f"🔍 Incoming reset request for email: {email}")

    if not email:
        print("❌ No email provided")
        return jsonify({"error": "Email is required"}), 400
    user = User.query.filter_by(email=email).first()
    if not user:
        
        return jsonify({'error': 'No account found with that email'}), 404

    try:
        s = generate_serializer()
        token = s.dumps(email, salt='password-reset-salt')
        reset_url = f"http://localhost:3000/reset-password/{token}"
        print(f"✅ Generated reset URL: {reset_url}")

        msg = Message(
            subject="Reset Your Password",
            recipients=[email],
            body=f"Click to reset your password: {reset_url}"
        )
        mail.send(msg)
        print(f"📧 Email sent to {email}")
        return jsonify({"message": f"Reset link sent to {email}"}), 200
    except Exception as e:
        print(f"❌ Error sending email: {e}")
        return jsonify({"error": str(e)}), 500
@auth_bp.route('/reset-password/<token>', methods=['POST'])
def reset_password(token):
    data = request.get_json()
    new_password = data.get('password')
    
    if not new_password:
        return jsonify({'error': 'Password is required'}), 400
    
   


    try:
        s = generate_serializer()
        email = s.loads(token, salt='password-reset-salt', max_age=3600)  # 1 hour expiry
        user = User.query.filter_by(email=email).first()

        

        user.set_password(new_password)
        db.session.commit()

        return jsonify({'message': 'Password reset successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400
