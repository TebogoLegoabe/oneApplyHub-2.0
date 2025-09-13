from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from app import db
from app.models import User, Property, Review, PropertyImage
from functools import wraps
import json

admin_bp = Blueprint('admin', __name__)

def admin_required(f):
    """Decorator to require admin access"""
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or not user.is_admin:
            return jsonify({'error': 'Admin access required'}), 403
        
        return f(*args, **kwargs)
    return decorated_function

@admin_bp.route('/login', methods=['POST'])
def admin_login():
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Missing email or password'}), 400
        
        email = data['email'].strip().lower()
        user = User.query.filter_by(email=email).first()
        
        if user and user.check_password(data['password']) and user.is_admin:
            access_token = create_access_token(identity=user.id)
            return jsonify({
                'access_token': access_token,
                'user': user.to_dict()
            }), 200
        
        return jsonify({'error': 'Invalid admin credentials'}), 401
        
    except Exception as e:
        print(f"Admin login error: {e}")
        return jsonify({'error': 'Login failed'}), 500

@admin_bp.route('/dashboard', methods=['GET'])
@admin_required
def dashboard():
    try:
        # Get platform statistics
        stats = {
            'total_properties': Property.query.count(),
            'approved_properties': Property.query.filter_by(approved=True).count(),
            'pending_properties': Property.query.filter_by(approved=False).count(),
            'total_users': User.query.filter_by(is_admin=False).count(),
            'verified_users': User.query.filter_by(verified=True, is_admin=False).count(),
            'total_reviews': Review.query.count(),
            'recent_reviews': Review.query.order_by(Review.created_at.desc()).limit(5).count()
        }
        
        # Get recent properties
        recent_properties = Property.query.order_by(Property.created_at.desc()).limit(12).all()
        
        return jsonify({
            'stats': stats,
            'recent_properties': [prop.to_dict() for prop in recent_properties]
        }), 200
        
    except Exception as e:
        print(f"Admin dashboard error: {e}")
        return jsonify({'error': 'Failed to load dashboard'}), 500

# Property Management Routes
@admin_bp.route('/properties', methods=['GET'])
@admin_required
def get_all_properties():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 12, type=int)
        status = request.args.get('status', 'all')  # all, approved, pending
        
        query = Property.query
        
        if status == 'approved':
            query = query.filter_by(approved=True)
        elif status == 'pending':
            query = query.filter_by(approved=False)
        
        properties = query.order_by(Property.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'properties': [prop.to_dict() for prop in properties.items],
            'total': properties.total,
            'pages': properties.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        print(f"Admin get properties error: {e}")
        return jsonify({'error': 'Failed to fetch properties'}), 500

@admin_bp.route('/properties', methods=['POST'])
@admin_required
def create_property():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        required_fields = ['name', 'address', 'property_type', 'price_min', 'price_max', 'university']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Create property
        property = Property(
            name=data['name'],
            address=data['address'],
            property_type=data['property_type'],
            price_min=int(data['price_min']),
            price_max=int(data['price_max']),
            description=data.get('description', ''),
            amenities=json.dumps(data.get('amenities', [])),
            contact_info=data.get('contact_info', ''),
            university=data['university'],
            approved=True  # Admin-created properties are auto-approved
        )
        
        db.session.add(property)
        db.session.commit()
        
        return jsonify({
            'message': 'Property created successfully',
            'property': property.to_dict()
        }), 201
        
    except Exception as e:
        print(f"Admin create property error: {e}")
        db.session.rollback()
        return jsonify({'error': 'Failed to create property'}), 500

@admin_bp.route('/properties/<int:property_id>', methods=['PUT'])
@admin_required
def update_property(property_id):
    try:
        property = Property.query.get_or_404(property_id)
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Update fields
        if 'name' in data:
            property.name = data['name']
        if 'address' in data:
            property.address = data['address']
        if 'property_type' in data:
            property.property_type = data['property_type']
        if 'price_min' in data:
            property.price_min = int(data['price_min'])
        if 'price_max' in data:
            property.price_max = int(data['price_max'])
        if 'description' in data:
            property.description = data['description']
        if 'amenities' in data:
            property.amenities = json.dumps(data['amenities'])
        if 'contact_info' in data:
            property.contact_info = data['contact_info']
        if 'university' in data:
            property.university = data['university']
        if 'approved' in data:
            property.approved = bool(data['approved'])
        
        db.session.commit()
        
        return jsonify({
            'message': 'Property updated successfully',
            'property': property.to_dict()
        }), 200
        
    except Exception as e:
        print(f"Admin update property error: {e}")
        db.session.rollback()
        return jsonify({'error': 'Failed to update property'}), 500

@admin_bp.route('/properties/<int:property_id>', methods=['DELETE'])
@admin_required
def delete_property(property_id):
    try:
        property = Property.query.get_or_404(property_id)
        
        # Delete associated reviews and images
        Review.query.filter_by(property_id=property_id).delete()
        PropertyImage.query.filter_by(property_id=property_id).delete()
        
        # Delete property
        db.session.delete(property)
        db.session.commit()
        
        return jsonify({'message': 'Property deleted successfully'}), 200
        
    except Exception as e:
        print(f"Admin delete property error: {e}")
        db.session.rollback()
        return jsonify({'error': 'Failed to delete property'}), 500

@admin_bp.route('/properties/<int:property_id>/approve', methods=['POST'])
@admin_required
def approve_property(property_id):
    try:
        property = Property.query.get_or_404(property_id)
        property.approved = True
        db.session.commit()
        
        return jsonify({
            'message': 'Property approved successfully',
            'property': property.to_dict()
        }), 200
        
    except Exception as e:
        print(f"Admin approve property error: {e}")
        db.session.rollback()
        return jsonify({'error': 'Failed to approve property'}), 500

# User Management Routes
@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_all_users():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 12, type=int)
        
        users = User.query.filter_by(is_admin=False).order_by(User.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'users': [user.to_dict() for user in users.items],
            'total': users.total,
            'pages': users.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        print(f"Admin get users error: {e}")
        return jsonify({'error': 'Failed to fetch users'}), 500

@admin_bp.route('/users/<int:user_id>/verify', methods=['POST'])
@admin_required
def verify_user(user_id):
    try:
        user = User.query.get_or_404(user_id)
        user.verified = True
        db.session.commit()
        
        return jsonify({
            'message': 'User verified successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        print(f"Admin verify user error: {e}")
        db.session.rollback()
        return jsonify({'error': 'Failed to verify user'}), 500

# Review Management Routes
@admin_bp.route('/reviews', methods=['GET'])
@admin_required
def get_all_reviews_admin():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 12, type=int)
        
        # Get all reviews with property and user info
        query = db.session.query(Review, Property, User).join(
            Property, Review.property_id == Property.id
        ).join(
            User, Review.user_id == User.id
        ).order_by(Review.created_at.desc())
        
        results = query.paginate(page=page, per_page=per_page, error_out=False)
        
        # Format response
        reviews = []
        for review, property, user in results.items:
            review_dict = review.to_dict()
            review_dict['property_name'] = property.name
            review_dict['property_id'] = property.id
            review_dict['user_name'] = user.name
            review_dict['user_email'] = user.email
            reviews.append(review_dict)
        
        return jsonify({
            'reviews': reviews,
            'total': results.total,
            'pages': results.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        print(f"Admin get reviews error: {e}")
        return jsonify({'error': 'Failed to fetch reviews'}), 500

@admin_bp.route('/reviews/<int:review_id>', methods=['DELETE'])
@admin_required
def delete_review(review_id):
    try:
        review = Review.query.get_or_404(review_id)
        db.session.delete(review)
        db.session.commit()
        
        return jsonify({'message': 'Review deleted successfully'}), 200
        
    except Exception as e:
        print(f"Admin delete review error: {e}")
        db.session.rollback()
        return jsonify({'error': 'Failed to delete review'}), 500