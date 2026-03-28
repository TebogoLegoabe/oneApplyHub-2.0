import logging

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import or_, update
from sqlalchemy.exc import IntegrityError

from app import db, limiter
from app.models import Review, Property, User, HelpfulVote

logger = logging.getLogger(__name__)
reviews_bp = Blueprint('reviews', __name__)

_MAX_PER_PAGE = 50


def _build_review_dict(review: Review, property_obj: Property, user: User) -> dict:
    d = {
        'id': review.id,
        'user_id': review.user_id,
        'property_id': review.property_id,
        'overall_rating': review.overall_rating,
        'value_rating': review.value_rating,
        'location_rating': review.location_rating,
        'safety_rating': review.safety_rating,
        'cleanliness_rating': review.cleanliness_rating,
        'management_rating': review.management_rating,
        'facilities_rating': review.facilities_rating,
        'review_text': review.review_text,
        'pros': review.pros,
        'cons': review.cons,
        'recommend': review.recommend,
        'anonymous': review.anonymous,
        'helpful_count': review.helpful_count or 0,
        'property_name': property_obj.name,
        'created_at': review.created_at.isoformat() if review.created_at else None,
        'updated_at': review.updated_at.isoformat() if review.updated_at else None,
    }
    if review.anonymous:
        d['author'] = 'Anonymous'
        d['author_university'] = user.university
        d['author_year'] = None
    else:
        d['author'] = user.name
        d['author_university'] = user.university
        d['author_year'] = user.year_of_study
    return d


@reviews_bp.route('', methods=['GET'])
@reviews_bp.route('/', methods=['GET'])
def get_all_reviews():
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 12, type=int), _MAX_PER_PAGE)
    university = request.args.get('university')
    min_rating = request.args.get('min_rating', type=int)
    search = request.args.get('search', '').strip()

    query = (
        db.session.query(Review, Property, User)
        .join(Property, Review.property_id == Property.id)
        .join(User, Review.user_id == User.id)
        .filter(Property.approved == True)   # noqa: E712
        .filter(Review.approved == True)     # noqa: E712  only show moderated reviews
    )

    if university and university != 'all':
        query = query.filter(User.university == university)
    if min_rating:
        query = query.filter(Review.overall_rating >= min_rating)
    if search:
        term = f'%{search}%'
        query = query.filter(
            or_(Property.name.ilike(term), Review.review_text.ilike(term))
        )

    query = query.order_by(Review.created_at.desc())

    try:
        results = query.paginate(page=page, per_page=per_page, error_out=False)
    except Exception:
        logger.exception('Failed to fetch reviews')
        return jsonify({'error': 'Failed to fetch reviews'}), 500

    reviews = []
    for review, prop, user in results.items:
        try:
            reviews.append(_build_review_dict(review, prop, user))
        except Exception:
            logger.exception('Error serialising review %s', review.id)

    return jsonify({
        'reviews': reviews,
        'total': results.total,
        'total_pages': results.pages,
        'current_page': page,
    }), 200


@reviews_bp.route('/property/<int:property_id>', methods=['GET'])
def get_property_reviews(property_id):
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 12, type=int), _MAX_PER_PAGE)

    prop = db.session.get(Property, property_id)
    if not prop:
        return jsonify({'error': 'Property not found'}), 404

    query = (
        db.session.query(Review, User)
        .join(User, Review.user_id == User.id)
        .filter(Review.property_id == property_id)
        .filter(Review.approved == True)  # noqa: E712  only show moderated reviews
        .order_by(Review.created_at.desc())
    )

    try:
        results = query.paginate(page=page, per_page=per_page, error_out=False)
    except Exception:
        logger.exception('Failed to fetch property reviews for %s', property_id)
        return jsonify({'error': 'Failed to fetch reviews'}), 500

    reviews = []
    for review, user in results.items:
        try:
            reviews.append(_build_review_dict(review, prop, user))
        except Exception:
            logger.exception('Error serialising review %s', review.id)

    return jsonify({
        'reviews': reviews,
        'total': results.total,
        'total_pages': results.pages,
        'current_page': page,
        'property': {'id': prop.id, 'name': prop.name},
    }), 200


@reviews_bp.route('/property/<int:property_id>', methods=['POST'])
@jwt_required()
@limiter.limit('5 per hour')
def create_review(property_id):
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}

    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if not user.verified:
        return jsonify({
            'error': 'Please verify your email address before writing reviews',
            'requires_verification': True,
        }), 403

    prop = db.session.get(Property, property_id)
    if not prop or not prop.approved:
        return jsonify({'error': 'Property not found'}), 404

    # Enforce unique review via DB constraint — check here for a clear error
    if Review.query.filter_by(user_id=user_id, property_id=property_id).first():
        return jsonify({'error': 'You have already reviewed this property'}), 409

    # Validate required fields
    overall_rating = data.get('overall_rating')
    review_text = (data.get('review_text') or '').strip()
    recommend = data.get('recommend')

    if not overall_rating or not (1 <= int(overall_rating) <= 5):
        return jsonify({'error': 'Overall rating must be between 1 and 5'}), 400
    if len(review_text) < 50:
        return jsonify({'error': 'Review must be at least 50 characters'}), 400
    if len(review_text) > 5000:
        return jsonify({'error': 'Review must be under 5000 characters'}), 400
    if recommend is None:
        return jsonify({'error': 'Recommendation is required'}), 400

    def _bounded_rating(val):
        if val is None:
            return None
        v = int(val)
        return v if 1 <= v <= 5 else None

    review = Review(
        user_id=user_id,
        property_id=property_id,
        overall_rating=int(overall_rating),
        value_rating=_bounded_rating(data.get('value_rating')),
        location_rating=_bounded_rating(data.get('location_rating')),
        safety_rating=_bounded_rating(data.get('safety_rating')),
        cleanliness_rating=_bounded_rating(data.get('cleanliness_rating')),
        management_rating=_bounded_rating(data.get('management_rating')),
        facilities_rating=_bounded_rating(data.get('facilities_rating')),
        review_text=review_text,
        pros=(data.get('pros') or '').strip()[:1000] or None,
        cons=(data.get('cons') or '').strip()[:1000] or None,
        recommend=bool(recommend),
        anonymous=bool(data.get('anonymous', False)),
    )

    try:
        db.session.add(review)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'You have already reviewed this property'}), 409
    except Exception:
        logger.exception('Failed to create review for property %s', property_id)
        db.session.rollback()
        return jsonify({'error': 'Failed to create review'}), 500

    return jsonify({
        'message': 'Review submitted successfully',
        'review': {
            'id': review.id,
            'property_id': review.property_id,
            'overall_rating': review.overall_rating,
            'review_text': review.review_text,
            'recommend': review.recommend,
            'anonymous': review.anonymous,
            'created_at': review.created_at.isoformat() if review.created_at else None,
        },
    }), 201


@reviews_bp.route('/<int:review_id>/helpful', methods=['POST'])
@jwt_required()
@limiter.limit('30 per minute')
def mark_helpful(review_id):
    user_id = int(get_jwt_identity())

    review = db.session.get(Review, review_id)
    if not review:
        return jsonify({'error': 'Review not found'}), 404

    if review.user_id == user_id:
        return jsonify({'error': 'You cannot vote on your own review'}), 400

    if HelpfulVote.query.filter_by(review_id=review_id, user_id=user_id).first():
        return jsonify({'error': 'You have already marked this review as helpful'}), 409

    try:
        vote = HelpfulVote(review_id=review_id, user_id=user_id)
        db.session.add(vote)
        # Atomic increment — prevents lost updates from concurrent requests
        db.session.execute(
            update(Review).where(Review.id == review_id).values(
                helpful_count=Review.helpful_count + 1
            )
        )
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'You have already marked this review as helpful'}), 409
    except Exception:
        logger.exception('Failed to mark review %s as helpful', review_id)
        db.session.rollback()
        return jsonify({'error': 'Failed to record vote'}), 500

    db.session.refresh(review)
    return jsonify({'helpful_count': review.helpful_count}), 200


@reviews_bp.route('/user/stats', methods=['GET'])
@jwt_required()
def get_user_review_stats():
    user_id = int(get_jwt_identity())

    user_reviews = Review.query.filter_by(user_id=user_id).order_by(Review.created_at.desc()).all()

    review_count = len(user_reviews)
    avg_rating = round(
        sum(r.overall_rating for r in user_reviews) / review_count, 1
    ) if review_count else 0.0
    total_helpful = sum(r.helpful_count or 0 for r in user_reviews)

    recent = []
    for r in user_reviews[:3]:
        prop = db.session.get(Property, r.property_id)
        recent.append({
            'id': r.id,
            'property_name': prop.name if prop else 'Unknown Property',
            'property_id': r.property_id,
            'overall_rating': r.overall_rating,
            'review_text': r.review_text[:100] + ('...' if len(r.review_text) > 100 else ''),
            'helpful_count': r.helpful_count or 0,
            'created_at': r.created_at.isoformat() if r.created_at else None,
        })

    return jsonify({
        'stats': {
            'reviewsCount': review_count,
            'avgRating': avg_rating,
            'helpfulVotes': total_helpful,
        },
        'recent_reviews': recent,
    }), 200
