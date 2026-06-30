import json
import logging
from functools import wraps

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app import db, limiter
from app.models import HelpfulVote, Property, PropertyAdmin, PropertyImage, Review, User

logger = logging.getLogger(__name__)
admin_bp = Blueprint('admin', __name__)


def _current_admin():
    return db.session.get(User, int(get_jwt_identity()))


def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user = _current_admin()
        if not user or not user.effective_is_admin:
            return jsonify({'error': 'Admin access required'}), 403
        return fn(*args, **kwargs)
    return wrapper


def super_admin_required(fn):
    @wraps(fn)
    @admin_required
    def wrapper(*args, **kwargs):
        user = _current_admin()
        if not user or not user.effective_is_super_admin:
            return jsonify({'error': 'Super admin access required'}), 403
        return fn(*args, **kwargs)
    return wrapper


def _assigned_property_ids(user):
    if user.effective_is_super_admin:
        return None
    rows = PropertyAdmin.query.filter_by(admin_user_id=user.id).all()
    return [row.property_id for row in rows]


def _can_manage_property(user, property_id):
    if user.effective_is_super_admin:
        return True
    return PropertyAdmin.query.filter_by(admin_user_id=user.id, property_id=property_id).first() is not None


def _application_property_ids(application):
    try:
        data = json.loads(application.form_data or '{}')
    except Exception:
        return []
    values = data.get('selectedResidences') or data.get('selected_residences') or []
    ids = []
    for value in values:
        try:
            ids.append(int(value))
        except (TypeError, ValueError):
            continue
    return ids


def _application_visible_to(user, application):
    assigned = _assigned_property_ids(user)
    if assigned is None:
        return True
    return bool(set(assigned) & set(_application_property_ids(application)))


def _application_dict(application, applicant=None):
    data = application.to_dict(include_form_data=True)
    property_ids = _application_property_ids(application)
    data['selected_property_ids'] = property_ids
    if property_ids:
        props = Property.query.filter(Property.id.in_(property_ids)).all()
        data['selected_properties'] = [p.to_dict() for p in props]
    else:
        data['selected_properties'] = []
    if applicant:
        data['applicant_email'] = applicant.email
        data['applicant_name'] = applicant.name
    return data


@admin_bp.route('/stats', methods=['GET'])
@admin_required
def get_stats():
    from app.models.application import Application
    user = _current_admin()
    assigned = _assigned_property_ids(user)

    if assigned is None:
        applications = Application.query.all()
        properties_query = Property.query
        reviews_query = Review.query
        user_count = User.query.count()
        verified_count = User.query.filter_by(verified=True).count()
    else:
        applications = [app for app in Application.query.all() if _application_visible_to(user, app)]
        properties_query = Property.query.filter(Property.id.in_(assigned)) if assigned else Property.query.filter(False)
        reviews_query = Review.query.filter(Review.property_id.in_(assigned)) if assigned else Review.query.filter(False)
        applicant_ids = [app.user_id for app in applications]
        user_count = len(set(applicant_ids))
        verified_count = User.query.filter(User.id.in_(applicant_ids), User.verified == True).count() if applicant_ids else 0  # noqa: E712

    return jsonify({
        'scope': 'super_admin' if user.effective_is_super_admin else 'managing_admin',
        'managed_property_ids': assigned or [],
        'total_users': user_count,
        'verified_users': verified_count,
        'total_properties': properties_query.count(),
        'pending_properties': properties_query.filter_by(approved=False).count(),
        'approved_properties': properties_query.filter_by(approved=True).count(),
        'total_reviews': reviews_query.count(),
        'pending_reviews': reviews_query.filter_by(approved=False).count(),
        'approved_reviews': reviews_query.filter_by(approved=True).count(),
        'total_applications': len(applications),
        'pending_applications': sum(1 for app in applications if app.status == 'pending'),
        'under_review_applications': sum(1 for app in applications if app.status == 'under_review'),
        'approved_applications': sum(1 for app in applications if app.status == 'approved'),
        'rejected_applications': sum(1 for app in applications if app.status == 'rejected'),
    }), 200


@admin_bp.route('/properties', methods=['GET'])
@admin_required
def list_properties():
    user = _current_admin()
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 100)
    status = request.args.get('status', 'all')
    query = Property.query
    assigned = _assigned_property_ids(user)
    if assigned is not None:
        query = query.filter(Property.id.in_(assigned)) if assigned else query.filter(False)
    if status == 'approved':
        query = query.filter_by(approved=True)
    elif status == 'pending':
        query = query.filter_by(approved=False)
    results = query.order_by(Property.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
    return jsonify({'properties': [p.to_dict() for p in results.items], 'total': results.total, 'pages': results.pages, 'current_page': page}), 200


@admin_bp.route('/properties', methods=['POST'])
@admin_required
def create_property():
    data = request.get_json(silent=True) or {}
    required = ['name', 'address', 'property_type', 'price_min', 'price_max', 'university']
    missing = [field for field in required if not data.get(field)]
    if missing:
        return jsonify({'error': f'Missing required fields: {", ".join(missing)}'}), 400
    amenities = data.get('amenities', [])
    prop = Property(
        name=data['name'].strip(), address=data['address'].strip(), property_type=data['property_type'],
        price_min=int(data['price_min']), price_max=int(data['price_max']), description=data.get('description', '').strip(),
        amenities=json.dumps(amenities) if isinstance(amenities, list) else amenities,
        contact_info=data.get('contact_info', '').strip(), university=data['university'],
        nsfas_accredited=bool(data.get('nsfas_accredited', False)), approved=True,
    )
    try:
        db.session.add(prop)
        db.session.flush()
        current = _current_admin()
        if not current.effective_is_super_admin:
            db.session.add(PropertyAdmin(property_id=prop.id, admin_user_id=current.id, assigned_by_user_id=current.id))
        db.session.commit()
    except Exception:
        logger.exception('Failed to create property')
        db.session.rollback()
        return jsonify({'error': 'Failed to create property'}), 500
    return jsonify({'message': 'Property created', 'property': prop.to_dict()}), 201


@admin_bp.route('/properties/<int:property_id>', methods=['PUT'])
@admin_required
def update_property(property_id):
    current = _current_admin()
    if not _can_manage_property(current, property_id):
        return jsonify({'error': 'You can only manage assigned properties'}), 403
    prop = db.session.get(Property, property_id)
    if not prop:
        return jsonify({'error': 'Property not found'}), 404
    data = request.get_json(silent=True) or {}
    for field in ('name', 'address', 'property_type', 'description', 'contact_info', 'university'):
        if field in data:
            setattr(prop, field, str(data[field]).strip())
    if 'price_min' in data:
        prop.price_min = int(data['price_min'])
    if 'price_max' in data:
        prop.price_max = int(data['price_max'])
    if 'amenities' in data:
        prop.amenities = json.dumps(data['amenities']) if isinstance(data['amenities'], list) else data['amenities']
    if 'approved' in data and current.effective_is_super_admin:
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
@super_admin_required
def toggle_approval(property_id):
    prop = db.session.get(Property, property_id)
    if not prop:
        return jsonify({'error': 'Property not found'}), 404
    data = request.get_json(silent=True) or {}
    prop.approved = data.get('approved', not prop.approved)
    db.session.commit()
    return jsonify({'id': prop.id, 'name': prop.name, 'approved': prop.approved}), 200


@admin_bp.route('/properties/<int:property_id>', methods=['DELETE'])
@super_admin_required
def delete_property(property_id):
    prop = db.session.get(Property, property_id)
    if not prop:
        return jsonify({'error': 'Property not found'}), 404
    try:
        PropertyAdmin.query.filter_by(property_id=property_id).delete()
        HelpfulVote.query.filter(HelpfulVote.review_id.in_(db.session.query(Review.id).filter_by(property_id=property_id))).delete(synchronize_session=False)
        Review.query.filter_by(property_id=property_id).delete()
        PropertyImage.query.filter_by(property_id=property_id).delete()
        db.session.delete(prop)
        db.session.commit()
    except Exception:
        logger.exception('Failed to delete property %s', property_id)
        db.session.rollback()
        return jsonify({'error': 'Failed to delete property'}), 500
    return jsonify({'message': f'Property "{prop.name}" deleted'}), 200


@admin_bp.route('/users', methods=['GET'])
@admin_required
def list_users():
    current = _current_admin()
    if not current.effective_is_super_admin:
        from app.models.application import Application
        visible_apps = [app for app in Application.query.all() if _application_visible_to(current, app)]
        ids = list({app.user_id for app in visible_apps})
        users = User.query.filter(User.id.in_(ids)).order_by(User.created_at.desc()).all() if ids else []
        return jsonify({'users': [u.to_dict() for u in users], 'total': len(users), 'pages': 1, 'current_page': 1}), 200
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 100)
    query = User.query
    university = request.args.get('university')
    verified = request.args.get('verified')
    if university:
        query = query.filter_by(university=university)
    if verified == 'true':
        query = query.filter_by(verified=True)
    elif verified == 'false':
        query = query.filter_by(verified=False)
    results = query.order_by(User.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
    return jsonify({'users': [u.to_dict() for u in results.items], 'total': results.total, 'pages': results.pages, 'current_page': page}), 200


@admin_bp.route('/users/<int:user_id>', methods=['PATCH'])
@super_admin_required
def update_user(user_id):
    current_id = int(get_jwt_identity())
    if user_id == current_id:
        return jsonify({'error': 'You cannot change your own admin status'}), 400
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    data = request.get_json(silent=True) or {}
    if 'verified' in data:
        user.verified = bool(data['verified'])
    if 'is_admin' in data:
        user.is_admin = bool(data['is_admin'])
    if 'is_super_admin' in data:
        user.is_super_admin = bool(data['is_super_admin'])
        if user.is_super_admin:
            user.is_admin = True
    db.session.commit()
    return jsonify({'user': user.to_dict()}), 200


@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@super_admin_required
def delete_user(user_id):
    if user_id == int(get_jwt_identity()):
        return jsonify({'error': 'You cannot delete your own account'}), 400
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': f'User "{user.email}" deleted'}), 200


@admin_bp.route('/property-admins', methods=['GET'])
@super_admin_required
def list_property_admins():
    rows = PropertyAdmin.query.order_by(PropertyAdmin.created_at.desc()).all()
    return jsonify({'assignments': [row.to_dict() for row in rows]}), 200


@admin_bp.route('/property-admins', methods=['POST'])
@super_admin_required
def assign_property_admin():
    data = request.get_json(silent=True) or {}
    property_id = data.get('property_id')
    admin_user_id = data.get('admin_user_id')
    if not property_id or not admin_user_id:
        return jsonify({'error': 'property_id and admin_user_id are required'}), 400
    prop = db.session.get(Property, int(property_id))
    admin_user = db.session.get(User, int(admin_user_id))
    if not prop or not admin_user:
        return jsonify({'error': 'Property or user not found'}), 404
    admin_user.is_admin = True
    existing = PropertyAdmin.query.filter_by(property_id=prop.id, admin_user_id=admin_user.id).first()
    if existing:
        return jsonify({'assignment': existing.to_dict()}), 200
    assignment = PropertyAdmin(property_id=prop.id, admin_user_id=admin_user.id, assigned_by_user_id=int(get_jwt_identity()))
    try:
        db.session.add(assignment)
        db.session.commit()
    except Exception:
        logger.exception('Failed to assign property admin')
        db.session.rollback()
        return jsonify({'error': 'Failed to assign admin'}), 500
    return jsonify({'assignment': assignment.to_dict(), 'user': admin_user.to_dict()}), 201


@admin_bp.route('/property-admins/<int:assignment_id>', methods=['DELETE'])
@super_admin_required
def remove_property_admin(assignment_id):
    row = db.session.get(PropertyAdmin, assignment_id)
    if not row:
        return jsonify({'error': 'Assignment not found'}), 404
    db.session.delete(row)
    db.session.commit()
    return jsonify({'message': 'Assignment removed'}), 200


@admin_bp.route('/reviews', methods=['GET'])
@admin_required
def list_reviews():
    user = _current_admin()
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 100)
    status = request.args.get('status', 'all')
    query = db.session.query(Review, Property, User).join(Property, Review.property_id == Property.id).join(User, Review.user_id == User.id)
    assigned = _assigned_property_ids(user)
    if assigned is not None:
        query = query.filter(Review.property_id.in_(assigned)) if assigned else query.filter(False)
    if status == 'pending':
        query = query.filter(Review.approved == False)  # noqa: E712
    elif status == 'approved':
        query = query.filter(Review.approved == True)  # noqa: E712
    results = query.order_by(Review.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
    reviews = []
    for review, prop, applicant in results.items:
        reviews.append({'id': review.id, 'property_id': review.property_id, 'property_name': prop.name, 'user_id': review.user_id, 'author': applicant.name if not review.anonymous else 'Anonymous', 'author_email': applicant.email, 'overall_rating': review.overall_rating, 'review_text': review.review_text[:200] + ('...' if len(review.review_text) > 200 else ''), 'recommend': review.recommend, 'anonymous': review.anonymous, 'approved': review.approved, 'helpful_count': review.helpful_count or 0, 'created_at': review.created_at.isoformat() if review.created_at else None})
    return jsonify({'reviews': reviews, 'total': results.total, 'pages': results.pages, 'current_page': page}), 200


@admin_bp.route('/reviews/<int:review_id>/approve', methods=['PATCH'])
@admin_required
def approve_review(review_id):
    current = _current_admin()
    review = db.session.get(Review, review_id)
    if not review:
        return jsonify({'error': 'Review not found'}), 404
    if not _can_manage_property(current, review.property_id):
        return jsonify({'error': 'You can only manage reviews for assigned properties'}), 403
    data = request.get_json(silent=True) or {}
    review.approved = bool(data.get('approved', not review.approved))
    db.session.commit()
    return jsonify({'id': review.id, 'approved': review.approved}), 200


@admin_bp.route('/reviews/<int:review_id>', methods=['DELETE'])
@admin_required
def delete_review(review_id):
    current = _current_admin()
    review = db.session.get(Review, review_id)
    if not review:
        return jsonify({'error': 'Review not found'}), 404
    if not _can_manage_property(current, review.property_id):
        return jsonify({'error': 'You can only manage reviews for assigned properties'}), 403
    HelpfulVote.query.filter_by(review_id=review_id).delete()
    db.session.delete(review)
    db.session.commit()
    return jsonify({'message': 'Review deleted'}), 200


@admin_bp.route('/applications', methods=['GET'])
@admin_required
def list_applications():
    from app.models.application import Application
    user = _current_admin()
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 100)
    status = request.args.get('status', 'all')
    query = db.session.query(Application, User).join(User, Application.user_id == User.id)
    if status != 'all':
        query = query.filter(Application.status == status)
    rows = query.order_by(Application.submitted_at.desc()).all()
    visible = [(app, applicant) for app, applicant in rows if _application_visible_to(user, app)]
    total = len(visible)
    start = (page - 1) * per_page
    items = visible[start:start + per_page]
    applications = [_application_dict(app, applicant) for app, applicant in items]
    pages = (total + per_page - 1) // per_page if total else 1
    return jsonify({'applications': applications, 'total': total, 'pages': pages, 'current_page': page}), 200


@admin_bp.route('/applications/<int:app_id>/status', methods=['PATCH'])
@admin_required
def update_application_status(app_id):
    from app.models.application import Application
    from app.utils import utcnow
    current = _current_admin()
    application = db.session.get(Application, app_id)
    if not application:
        return jsonify({'error': 'Application not found'}), 404
    if not _application_visible_to(current, application):
        return jsonify({'error': 'You can only manage applications for assigned properties'}), 403
    data = request.get_json(silent=True) or {}
    new_status = data.get('status')
    valid_statuses = ['pending', 'under_review', 'approved', 'rejected']
    if new_status not in valid_statuses:
        return jsonify({'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'}), 400
    application.status = new_status
    if 'admin_notes' in data:
        application.admin_notes = data['admin_notes']
    application.updated_at = utcnow()
    db.session.commit()
    return jsonify({'application': _application_dict(application)}), 200
