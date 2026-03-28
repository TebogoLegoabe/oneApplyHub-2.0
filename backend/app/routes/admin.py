import json
import logging
from functools import wraps

from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required

from app import db, limiter
from app.models import HelpfulVote, Property, PropertyImage, Review, User

logger = logging.getLogger(__name__)
admin_bp = Blueprint('admin', __name__)


# ---------------------------------------------------------------------------
# Admin guard
# ---------------------------------------------------------------------------

def admin_required(fn):
    """Require a valid JWT and is_admin == True."""
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user = db.session.get(User, int(get_jwt_identity()))
        if not user or not user.is_admin:
            return jsonify({'error': 'Admin access required'}), 403
        return fn(*args, **kwargs)
    return wrapper


# ---------------------------------------------------------------------------
# Stats / dashboard
# ---------------------------------------------------------------------------

@admin_bp.route('/stats', methods=['GET'])
@admin_required
def get_stats():
    return jsonify({
        'total_users': User.query.count(),
        'verified_users': User.query.filter_by(verified=True).count(),
        'total_properties': Property.query.count(),
        'pending_properties': Property.query.filter_by(approved=False).count(),
        'approved_properties': Property.query.filter_by(approved=True).count(),
        'total_reviews': Review.query.count(),
        'pending_reviews': Review.query.filter_by(approved=False).count(),
        'approved_reviews': Review.query.filter_by(approved=True).count(),
    }), 200


# ---------------------------------------------------------------------------
# Properties
# ---------------------------------------------------------------------------

@admin_bp.route('/properties', methods=['GET'])
@admin_required
def list_properties():
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 100)
    status = request.args.get('status', 'all')  # all | approved | pending

    query = Property.query
    if status == 'approved':
        query = query.filter_by(approved=True)
    elif status == 'pending':
        query = query.filter_by(approved=False)

    results = query.order_by(Property.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    return jsonify({
        'properties': [p.to_dict() for p in results.items],
        'total': results.total,
        'pages': results.pages,
        'current_page': page,
    }), 200


@admin_bp.route('/properties', methods=['POST'])
@admin_required
def create_property():
    data = request.get_json(silent=True) or {}
    required = ['name', 'address', 'property_type', 'price_min', 'price_max', 'university']
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({'error': f'Missing required fields: {", ".join(missing)}'}), 400

    amenities = data.get('amenities', [])
    prop = Property(
        name=data['name'].strip(),
        address=data['address'].strip(),
        property_type=data['property_type'],
        price_min=int(data['price_min']),
        price_max=int(data['price_max']),
        description=data.get('description', '').strip(),
        amenities=json.dumps(amenities) if isinstance(amenities, list) else amenities,
        contact_info=data.get('contact_info', '').strip(),
        university=data['university'],
        nsfas_accredited=bool(data.get('nsfas_accredited', False)),
        approved=True,
    )
    try:
        db.session.add(prop)
        db.session.commit()
    except Exception:
        logger.exception('Failed to create property')
        db.session.rollback()
        return jsonify({'error': 'Failed to create property'}), 500

    return jsonify({'message': 'Property created', 'property': prop.to_dict()}), 201


@admin_bp.route('/properties/<int:property_id>', methods=['PUT'])
@admin_required
def update_property(property_id):
    prop = db.session.get(Property, property_id)
    if not prop:
        return jsonify({'error': 'Property not found'}), 404

    data = request.get_json(silent=True) or {}
    string_fields = ('name', 'address', 'property_type', 'description', 'contact_info', 'university')
    for field in string_fields:
        if field in data:
            setattr(prop, field, str(data[field]).strip())
    if 'price_min' in data:
        prop.price_min = int(data['price_min'])
    if 'price_max' in data:
        prop.price_max = int(data['price_max'])
    if 'amenities' in data:
        amenities = data['amenities']
        prop.amenities = json.dumps(amenities) if isinstance(amenities, list) else amenities
    if 'approved' in data:
        prop.approved = bool(data['approved'])
    if 'nsfas_accredited' in data:
        prop.nsfas_accredited = bool(data['nsfas_accredited'])

    try:
        db.session.commit()
    except Exception:
        logger.exception('Failed to update property %s', property_id)
        db.session.rollback()
        return jsonify({'error': 'Failed to update property'}), 500

    return jsonify({'property': prop.to_dict()}), 200


@admin_bp.route('/properties/<int:property_id>/approve', methods=['PATCH'])
@admin_required
def toggle_approval(property_id):
    prop = db.session.get(Property, property_id)
    if not prop:
        return jsonify({'error': 'Property not found'}), 404

    data = request.get_json(silent=True) or {}
    prop.approved = data.get('approved', not prop.approved)

    try:
        db.session.commit()
    except Exception:
        logger.exception('Failed to toggle approval for property %s', property_id)
        db.session.rollback()
        return jsonify({'error': 'Failed to update property'}), 500

    return jsonify({'id': prop.id, 'name': prop.name, 'approved': prop.approved}), 200


@admin_bp.route('/properties/<int:property_id>', methods=['DELETE'])
@admin_required
def delete_property(property_id):
    prop = db.session.get(Property, property_id)
    if not prop:
        return jsonify({'error': 'Property not found'}), 404

    try:
        # Explicit cleanup (relations have no cascade set at DB level)
        HelpfulVote.query.filter(
            HelpfulVote.review_id.in_(
                db.session.query(Review.id).filter_by(property_id=property_id)
            )
        ).delete(synchronize_session=False)
        Review.query.filter_by(property_id=property_id).delete()
        PropertyImage.query.filter_by(property_id=property_id).delete()
        db.session.delete(prop)
        db.session.commit()
    except Exception:
        logger.exception('Failed to delete property %s', property_id)
        db.session.rollback()
        return jsonify({'error': 'Failed to delete property'}), 500

    return jsonify({'message': f'Property "{prop.name}" deleted'}), 200


# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------

@admin_bp.route('/users', methods=['GET'])
@admin_required
def list_users():
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 100)
    university = request.args.get('university')
    verified = request.args.get('verified')

    query = User.query
    if university:
        query = query.filter_by(university=university)
    if verified == 'true':
        query = query.filter_by(verified=True)
    elif verified == 'false':
        query = query.filter_by(verified=False)

    results = query.order_by(User.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    return jsonify({
        'users': [u.to_dict() for u in results.items],
        'total': results.total,
        'pages': results.pages,
        'current_page': page,
    }), 200


@admin_bp.route('/users/<int:user_id>', methods=['PATCH'])
@admin_required
def update_user(user_id):
    current_admin_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json(silent=True) or {}
    if 'verified' in data:
        user.verified = bool(data['verified'])
    if 'is_admin' in data:
        if user_id == current_admin_id:
            return jsonify({'error': 'You cannot change your own admin status'}), 400
        user.is_admin = bool(data['is_admin'])

    try:
        db.session.commit()
    except Exception:
        logger.exception('Failed to update user %s', user_id)
        db.session.rollback()
        return jsonify({'error': 'Failed to update user'}), 500

    return jsonify({'user': user.to_dict()}), 200


@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    current_admin_id = int(get_jwt_identity())
    if user_id == current_admin_id:
        return jsonify({'error': 'You cannot delete your own account'}), 400

    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    try:
        db.session.delete(user)
        db.session.commit()
    except Exception:
        logger.exception('Failed to delete user %s', user_id)
        db.session.rollback()
        return jsonify({'error': 'Failed to delete user'}), 500

    return jsonify({'message': f'User "{user.email}" deleted'}), 200


# ---------------------------------------------------------------------------
# Reviews
# ---------------------------------------------------------------------------

@admin_bp.route('/reviews', methods=['GET'])
@admin_required
def list_reviews():
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 100)
    status = request.args.get('status', 'all')  # all | pending | approved

    query = Review.query
    if status == 'pending':
        query = query.filter_by(approved=False)
    elif status == 'approved':
        query = query.filter_by(approved=True)

    results = (
        query
        .order_by(Review.created_at.desc())
        .paginate(page=page, per_page=per_page, error_out=False)
    )

    reviews = []
    for r in results.items:
        prop = db.session.get(Property, r.property_id)
        user = db.session.get(User, r.user_id)
        reviews.append({
            'id': r.id,
            'property_id': r.property_id,
            'property_name': prop.name if prop else 'Unknown',
            'user_id': r.user_id,
            'author': user.name if (user and not r.anonymous) else 'Anonymous',
            'author_email': user.email if user else None,
            'overall_rating': r.overall_rating,
            'review_text': r.review_text[:200] + ('...' if len(r.review_text) > 200 else ''),
            'recommend': r.recommend,
            'anonymous': r.anonymous,
            'approved': r.approved,
            'helpful_count': r.helpful_count or 0,
            'created_at': r.created_at.isoformat() if r.created_at else None,
        })

    return jsonify({
        'reviews': reviews,
        'total': results.total,
        'pages': results.pages,
        'current_page': page,
    }), 200


@admin_bp.route('/reviews/<int:review_id>/approve', methods=['PATCH'])
@admin_required
def approve_review(review_id):
    review = db.session.get(Review, review_id)
    if not review:
        return jsonify({'error': 'Review not found'}), 404

    data = request.get_json(silent=True) or {}
    review.approved = bool(data.get('approved', not review.approved))

    try:
        db.session.commit()
    except Exception:
        logger.exception('Failed to approve review %s', review_id)
        db.session.rollback()
        return jsonify({'error': 'Failed to update review'}), 500

    return jsonify({'id': review.id, 'approved': review.approved}), 200


@admin_bp.route('/reviews/<int:review_id>', methods=['DELETE'])
@admin_required
def delete_review(review_id):
    review = db.session.get(Review, review_id)
    if not review:
        return jsonify({'error': 'Review not found'}), 404

    try:
        HelpfulVote.query.filter_by(review_id=review_id).delete()
        db.session.delete(review)
        db.session.commit()
    except Exception:
        logger.exception('Failed to delete review %s', review_id)
        db.session.rollback()
        return jsonify({'error': 'Failed to delete review'}), 500

    return jsonify({'message': 'Review deleted'}), 200
