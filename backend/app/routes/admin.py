import json
import logging
import re
import secrets
import string
from functools import wraps

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app import db, limiter
from app.models import (
    AccommodationApplication,
    AccommodationApplicationProperty,
    ApplicantProfile,
    HelpfulVote,
    Property,
    PropertyAdmin,
    PropertyImage,
    Review,
    UniversityApplication,
    UniversityApplicationChoice,
    User,
)
from app.utils import utcnow

ACCOMMODATION_VALID_STATUSES = ('pending', 'under_review', 'approved', 'rejected')
UNIVERSITY_VALID_STATUSES = ('pending', 'under_review', 'approved', 'rejected')

logger = logging.getLogger(__name__)
admin_bp = Blueprint('admin', __name__)


EMAIL_RE = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')


def _generate_temp_password() -> str:
    """A random, one-time password for an admin account the super admin creates.

    Guarantees at least one letter and one digit so it always passes
    validate_password, without letting a human pick (and reuse) it.
    """
    alphabet = string.ascii_letters + string.digits
    while True:
        pwd = ''.join(secrets.choice(alphabet) for _ in range(14))
        if re.search(r'[A-Za-z]', pwd) and re.search(r'\d', pwd):
            return pwd


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
        if not user.mfa_enabled:
            return jsonify({
                'error': 'Enable two-factor authentication on your account before managing admins.',
                'mfa_setup_required': True,
            }), 403
        return fn(*args, **kwargs)
    return wrapper


def university_applications_admin_required(fn):
    @wraps(fn)
    @admin_required
    def wrapper(*args, **kwargs):
        user = _current_admin()
        if not user or not user.effective_can_manage_university_applications:
            return jsonify({'error': 'University applications access required'}), 403
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


def _applicant_display_name(applicant, profile):
    if profile and (profile.first_name or profile.last_name):
        return f'{profile.first_name} {profile.last_name}'.strip()
    return applicant.name


def _assign_properties_to_admin(admin_user, property_ids, assigned_by_user_id):
    created = []
    for property_id in property_ids:
        prop = db.session.get(Property, int(property_id))
        if not prop:
            raise ValueError(f'Property not found: {property_id}')
        existing = PropertyAdmin.query.filter_by(property_id=prop.id, admin_user_id=admin_user.id).first()
        if existing:
            created.append(existing)
            continue
        assignment = PropertyAdmin(
            property_id=prop.id,
            admin_user_id=admin_user.id,
            assigned_by_user_id=assigned_by_user_id,
        )
        db.session.add(assignment)
        created.append(assignment)
    return created


@admin_bp.route('/stats', methods=['GET'])
@admin_required
def get_stats():
    user = _current_admin()
    assigned = _assigned_property_ids(user)

    accommodation_query = AccommodationApplicationProperty.query
    if assigned is not None:
        accommodation_query = (
            accommodation_query.filter(AccommodationApplicationProperty.property_id.in_(assigned))
            if assigned else accommodation_query.filter(False)
        )

    if assigned is None:
        properties_query = Property.query
        reviews_query = Review.query
        user_count = User.query.count()
        verified_count = User.query.filter_by(verified=True).count()
    else:
        properties_query = Property.query.filter(Property.id.in_(assigned)) if assigned else Property.query.filter(False)
        reviews_query = Review.query.filter(Review.property_id.in_(assigned)) if assigned else Review.query.filter(False)
        applicant_ids = [row.application.user_id for row in accommodation_query.all()]
        user_count = len(set(applicant_ids))
        verified_count = User.query.filter(User.id.in_(applicant_ids), User.verified == True).count() if applicant_ids else 0  # noqa: E712

    stats = {
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
        'total_applications': accommodation_query.count(),
        'pending_applications': accommodation_query.filter(AccommodationApplicationProperty.status == 'pending').count(),
        'under_review_applications': accommodation_query.filter(AccommodationApplicationProperty.status == 'under_review').count(),
        'approved_applications': accommodation_query.filter(AccommodationApplicationProperty.status == 'approved').count(),
        'rejected_applications': accommodation_query.filter(AccommodationApplicationProperty.status == 'rejected').count(),
    }
    if user.effective_is_super_admin:
        stats['total_university_applications'] = UniversityApplication.query.count()
    return jsonify(stats), 200


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
        contact_info=data.get('contact_info', '').strip(), website=data.get('website', '').strip(),
        university=data['university'],
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
    for field in ('name', 'address', 'property_type', 'description', 'contact_info', 'website', 'university'):
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


@admin_bp.route('/properties/<int:property_id>/images', methods=['POST'])
@admin_required
def add_property_image(property_id):
    current = _current_admin()
    if not _can_manage_property(current, property_id):
        return jsonify({'error': 'You can only manage assigned properties'}), 403
    prop = db.session.get(Property, property_id)
    if not prop:
        return jsonify({'error': 'Property not found'}), 404

    data = request.get_json(silent=True) or {}
    image_url = (data.get('image_url') or '').strip()
    if not image_url:
        return jsonify({'error': 'image_url is required'}), 400
    if not (image_url.startswith('http://') or image_url.startswith('https://')):
        return jsonify({'error': 'image_url must be a valid http(s) URL'}), 400
    if len(image_url) > 500:
        return jsonify({'error': 'image_url is too long (max 500 characters)'}), 400

    is_primary = bool(data.get('is_primary', False))
    image = PropertyImage(
        property_id=property_id, image_url=image_url,
        caption=(data.get('caption') or '').strip() or None, is_primary=is_primary,
    )
    try:
        if is_primary:
            PropertyImage.query.filter_by(property_id=property_id).update({'is_primary': False})
        db.session.add(image)
        db.session.commit()
    except Exception:
        logger.exception('Failed to add image for property %s', property_id)
        db.session.rollback()
        return jsonify({'error': 'Failed to add image'}), 500
    return jsonify({'message': 'Image added', 'image': image.to_dict()}), 201


@admin_bp.route('/properties/<int:property_id>/images/<int:image_id>', methods=['PATCH'])
@admin_required
def update_property_image(property_id, image_id):
    current = _current_admin()
    if not _can_manage_property(current, property_id):
        return jsonify({'error': 'You can only manage assigned properties'}), 403
    image = PropertyImage.query.filter_by(id=image_id, property_id=property_id).first()
    if not image:
        return jsonify({'error': 'Image not found for this property'}), 404

    data = request.get_json(silent=True) or {}
    if 'caption' in data:
        image.caption = (data.get('caption') or '').strip() or None
    if data.get('is_primary'):
        PropertyImage.query.filter_by(property_id=property_id).update({'is_primary': False})
        image.is_primary = True
    elif 'is_primary' in data:
        image.is_primary = False
    try:
        db.session.commit()
    except Exception:
        logger.exception('Failed to update image %s', image_id)
        db.session.rollback()
        return jsonify({'error': 'Failed to update image'}), 500
    return jsonify({'image': image.to_dict()}), 200


@admin_bp.route('/properties/<int:property_id>/images/<int:image_id>', methods=['DELETE'])
@admin_required
def delete_property_image(property_id, image_id):
    current = _current_admin()
    if not _can_manage_property(current, property_id):
        return jsonify({'error': 'You can only manage assigned properties'}), 403
    image = PropertyImage.query.filter_by(id=image_id, property_id=property_id).first()
    if not image:
        return jsonify({'error': 'Image not found for this property'}), 404
    db.session.delete(image)
    db.session.commit()
    return jsonify({'message': 'Image deleted'}), 200


@admin_bp.route('/users', methods=['GET'])
@admin_required
def list_users():
    current = _current_admin()
    if not current.effective_is_super_admin:
        assigned = _assigned_property_ids(current)
        rows = (
            AccommodationApplicationProperty.query.filter(AccommodationApplicationProperty.property_id.in_(assigned)).all()
            if assigned else []
        )
        ids = list({row.application.user_id for row in rows})
        users = User.query.filter(User.id.in_(ids)).order_by(User.created_at.desc()).all() if ids else []
        return jsonify({'users': [u.to_dict() for u in users], 'total': len(users), 'pages': 1, 'current_page': 1}), 200
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 100)
    query = User.query
    university = request.args.get('university')
    verified = request.args.get('verified')
    role = request.args.get('role')
    if university:
        query = query.filter_by(university=university)
    if verified == 'true':
        query = query.filter_by(verified=True)
    elif verified == 'false':
        query = query.filter_by(verified=False)
    if role == 'admin':
        query = query.filter(User.is_admin == True, User.is_super_admin == False)  # noqa: E712
    elif role == 'super_admin':
        query = query.filter(User.is_super_admin == True)  # noqa: E712
    elif role == 'student':
        query = query.filter(User.is_admin == False, User.is_super_admin == False)  # noqa: E712
    results = query.order_by(User.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
    return jsonify({'users': [u.to_dict() for u in results.items], 'total': results.total, 'pages': results.pages, 'current_page': page}), 200


@admin_bp.route('/admin-users', methods=['POST'])
@super_admin_required
def create_admin_user():
    data = request.get_json(silent=True) or {}
    email = str(data.get('email', '')).strip().lower()
    name = str(data.get('name', '')).strip()
    reset_password = bool(data.get('reset_password', False))
    property_ids = data.get('property_ids') or []
    grant_university_applications = bool(data.get('can_manage_university_applications', False))

    if not EMAIL_RE.match(email):
        return jsonify({'error': 'A valid admin email is required'}), 400
    if not name:
        return jsonify({'error': 'Admin name is required'}), 400
    if not isinstance(property_ids, list):
        return jsonify({'error': 'Invalid property selection'}), 400
    if not property_ids and not grant_university_applications:
        return jsonify({'error': 'Select at least one property or grant university applications access'}), 400

    user = User.query.filter(db.func.lower(User.email) == email).first()
    creating = user is None
    temp_password = None

    try:
        if creating:
            # The password is always generated here, never supplied by the caller —
            # letting a human type (and reuse) a password for someone else's
            # account is exactly how these temp passwords end up identical
            # across admins.
            temp_password = _generate_temp_password()
            user = User(
                email=email,
                name=name,
                university='admin',
                year_of_study='Admin',
                faculty='Property Management',
                verified=True,
                is_admin=True,
                is_super_admin=False,
                can_manage_university_applications=grant_university_applications,
                must_change_password=True,
            )
            user.set_password(temp_password)
            db.session.add(user)
            db.session.flush()
        else:
            user.name = name or user.name
            user.verified = True
            user.is_admin = True
            if 'can_manage_university_applications' in data:
                user.can_manage_university_applications = grant_university_applications
            if reset_password:
                temp_password = _generate_temp_password()
                user.set_password(temp_password)
                user.must_change_password = True

        assignments = _assign_properties_to_admin(user, property_ids, int(get_jwt_identity()))
        db.session.commit()
    except ValueError as exc:
        db.session.rollback()
        return jsonify({'error': str(exc)}), 404
    except Exception:
        logger.exception('Failed to create property admin user')
        db.session.rollback()
        return jsonify({'error': 'Failed to create admin user'}), 500

    return jsonify({
        'message': 'Admin created and assigned' if creating else 'Admin updated and assigned',
        'user': user.to_dict(),
        'assignments': [assignment.to_dict() for assignment in assignments],
        # Only ever returned once, right after generation — never stored in plaintext or retrievable again.
        'temporary_password': temp_password,
    }), 201 if creating else 200


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
    if 'can_manage_university_applications' in data:
        user.can_manage_university_applications = bool(data['can_manage_university_applications'])
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


@admin_bp.route('/accommodation-applications', methods=['GET'])
@admin_required
def list_accommodation_applications():
    user = _current_admin()
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 100)
    status = request.args.get('status', 'all')

    query = (
        db.session.query(AccommodationApplicationProperty, AccommodationApplication, User)
        .join(AccommodationApplication, AccommodationApplicationProperty.accommodation_application_id == AccommodationApplication.id)
        .join(User, AccommodationApplication.user_id == User.id)
    )
    assigned = _assigned_property_ids(user)
    if assigned is not None:
        query = query.filter(AccommodationApplicationProperty.property_id.in_(assigned)) if assigned else query.filter(False)
    if status != 'all':
        query = query.filter(AccommodationApplicationProperty.status == status)

    results = query.order_by(AccommodationApplicationProperty.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)

    items = []
    for app_property, application, applicant in results.items:
        profile = ApplicantProfile.query.filter_by(user_id=applicant.id).first()
        item = app_property.to_dict()
        item['application'] = application.to_dict()
        item['applicant_profile'] = profile.to_dict() if profile else None
        item['applicant_email'] = applicant.email
        item['applicant_name'] = _applicant_display_name(applicant, profile)
        items.append(item)

    return jsonify({'applications': items, 'total': results.total, 'pages': results.pages, 'current_page': page}), 200


@admin_bp.route('/accommodation-applications/<int:application_id>/properties/<int:property_id>/status', methods=['PATCH'])
@admin_required
def update_accommodation_application_property_status(application_id, property_id):
    current = _current_admin()
    if not _can_manage_property(current, property_id):
        return jsonify({'error': 'You can only manage applications for assigned properties'}), 403
    row = AccommodationApplicationProperty.query.filter_by(
        accommodation_application_id=application_id, property_id=property_id,
    ).first()
    if not row:
        return jsonify({'error': 'Application not found for this property'}), 404
    data = request.get_json(silent=True) or {}
    new_status = data.get('status')
    if new_status not in ACCOMMODATION_VALID_STATUSES:
        return jsonify({'error': f'Invalid status. Must be one of: {", ".join(ACCOMMODATION_VALID_STATUSES)}'}), 400
    row.status = new_status
    if 'admin_notes' in data:
        row.admin_notes = data['admin_notes']
    row.reviewed_by_user_id = current.id
    row.reviewed_at = utcnow()
    db.session.commit()
    return jsonify({'application_property': row.to_dict()}), 200


@admin_bp.route('/accommodation-applications/<int:application_id>/properties/<int:property_id>', methods=['DELETE'])
@admin_required
def delete_accommodation_application_property(application_id, property_id):
    current = _current_admin()
    if not _can_manage_property(current, property_id):
        return jsonify({'error': 'You can only manage applications for assigned properties'}), 403
    row = AccommodationApplicationProperty.query.filter_by(
        accommodation_application_id=application_id, property_id=property_id,
    ).first()
    if not row:
        return jsonify({'error': 'Application not found for this property'}), 404

    db.session.delete(row)
    db.session.flush()

    # If that was the student's last property row, the shared parent
    # submission (documents, profile snapshot) has nothing left to serve.
    remaining = AccommodationApplicationProperty.query.filter_by(
        accommodation_application_id=application_id,
    ).count()
    if remaining == 0:
        parent = db.session.get(AccommodationApplication, application_id)
        if parent:
            db.session.delete(parent)

    db.session.commit()
    return jsonify({'message': 'Application deleted'}), 200


@admin_bp.route('/university-applications', methods=['GET'])
@university_applications_admin_required
def list_university_applications():
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 100)
    query = db.session.query(UniversityApplication, User).join(User, UniversityApplication.user_id == User.id)
    results = query.order_by(UniversityApplication.submitted_at.desc()).paginate(page=page, per_page=per_page, error_out=False)

    items = []
    for application, applicant in results.items:
        profile = ApplicantProfile.query.filter_by(user_id=applicant.id).first()
        data = application.to_dict()
        data['applicant_profile'] = profile.to_dict() if profile else None
        data['applicant_email'] = applicant.email
        data['applicant_name'] = _applicant_display_name(applicant, profile)
        items.append(data)

    return jsonify({'applications': items, 'total': results.total, 'pages': results.pages, 'current_page': page}), 200


@admin_bp.route('/university-applications/<int:application_id>/choices/<int:choice_id>/status', methods=['PATCH'])
@university_applications_admin_required
def update_university_choice_status(application_id, choice_id):
    choice = UniversityApplicationChoice.query.filter_by(id=choice_id, university_application_id=application_id).first()
    if not choice:
        return jsonify({'error': 'Choice not found'}), 404
    data = request.get_json(silent=True) or {}
    new_status = data.get('status')
    if new_status not in UNIVERSITY_VALID_STATUSES:
        return jsonify({'error': f'Invalid status. Must be one of: {", ".join(UNIVERSITY_VALID_STATUSES)}'}), 400
    choice.status = new_status
    if 'admin_notes' in data:
        choice.admin_notes = data['admin_notes']
    choice.reviewed_by_user_id = int(get_jwt_identity())
    choice.reviewed_at = utcnow()
    db.session.commit()
    return jsonify({'choice': choice.to_dict()}), 200
