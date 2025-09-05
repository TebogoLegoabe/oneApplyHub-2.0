from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import or_
from app import db
from app.models import Review, Property, User

reviews_bp = Blueprint('reviews', __name__)

@reviews_bp.route('', methods=['GET'])
@reviews_bp.route('/', methods=['GET'])
def get_all_reviews():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 12, type=int)
        university = request.args.get('university')
        min_rating = request.args.get('min_rating', type=int)
        search = request.args.get('search')
        
        print(f"Debug: Fetching reviews with filters - university: {university}, min_rating: {min_rating}, search: {search}")
        
        # Base query - get all reviews with property and user info
        query = db.session.query(Review, Property, User).join(
            Property, Review.property_id == Property.id
        ).join(
            User, Review.user_id == User.id
        )
        
        # Filter by approved properties only
        query = query.filter(Property.approved == True)
        
        # Apply filters
        if university and university != 'all':
            query = query.filter(User.university == university)
        
        if min_rating:
            query = query.filter(Review.overall_rating >= min_rating)
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Property.name.ilike(search_term),  # Use 'name' not 'title'
                    Review.review_text.ilike(search_term)
                )
            )
        
        # Order by newest first
        query = query.order_by(Review.created_at.desc())
        
        # Get total count before pagination
        total_count = query.count()
        print(f"Debug: Total reviews found: {total_count}")
        
        # Paginate
        results = query.paginate(page=page, per_page=per_page, error_out=False)
        
        # Format response
        reviews = []
        for review, property_obj, user in results.items:
            try:
                # Create review dict manually to avoid relationship issues
                review_dict = {
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
                    'created_at': review.created_at.isoformat() if review.created_at else None,
                    'updated_at': review.updated_at.isoformat() if review.updated_at else None
                }
                
                # Add property info
                review_dict['property_name'] = property_obj.name
                review_dict['property_id'] = property_obj.id
                
                # Add user info (respecting anonymity)
                if not review.anonymous:
                    review_dict['author'] = user.name
                    review_dict['author_university'] = user.university
                    review_dict['author_year'] = user.year_of_study
                else:
                    review_dict['author'] = 'Anonymous'
                    review_dict['author_university'] = user.university if user.university else None
                    review_dict['author_year'] = None
                
                reviews.append(review_dict)
                
            except Exception as e:
                print(f"Error processing review {review.id}: {e}")
                continue
        
        print(f"Debug: Successfully processed {len(reviews)} reviews")
        
        return jsonify({
            'reviews': reviews,
            'total': results.total,
            'total_pages': results.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        print(f"Error fetching all reviews: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to fetch reviews', 'details': str(e)}), 500

@reviews_bp.route('/property/<int:property_id>', methods=['GET'])
def get_property_reviews(property_id):
    """Get reviews for a specific property"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 12, type=int)
        
        # Check if property exists
        property_obj = Property.query.get_or_404(property_id)
        
        # Get reviews for this property
        query = db.session.query(Review, User).join(
            User, Review.user_id == User.id
        ).filter(Review.property_id == property_id)
        
        # Order by newest first
        query = query.order_by(Review.created_at.desc())
        
        # Paginate
        results = query.paginate(page=page, per_page=per_page, error_out=False)
        
        # Format response
        reviews = []
        for review, user in results.items:
            try:
                # Create review dict manually
                review_dict = {
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
                    'created_at': review.created_at.isoformat() if review.created_at else None,
                    'updated_at': review.updated_at.isoformat() if review.updated_at else None
                }
                
                # Add user info (respecting anonymity)
                if not review.anonymous:
                    review_dict['author'] = user.name
                    review_dict['author_university'] = user.university
                    review_dict['author_year'] = user.year_of_study
                else:
                    review_dict['author'] = 'Anonymous'
                    review_dict['author_university'] = user.university if user.university else None
                    review_dict['author_year'] = None
                
                reviews.append(review_dict)
                
            except Exception as e:
                print(f"Error processing review {review.id}: {e}")
                continue
        
        return jsonify({
            'reviews': reviews,
            'total': results.total,
            'total_pages': results.pages,
            'current_page': page,
            'property': {
                'id': property_obj.id,
                'name': property_obj.name
            }
        }), 200
        
    except Exception as e:
        print(f"Error fetching property reviews: {e}")
        return jsonify({'error': 'Failed to fetch property reviews'}), 500

@reviews_bp.route('/property/<int:property_id>', methods=['POST'])
@jwt_required()
def create_review(property_id):
    try:
        print("=== REVIEW REQUEST RECEIVED ===")
        print(f"Property ID: {property_id}")
        print(f"Request data: {request.get_json()}")
        
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validation
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Check if property exists
        property_obj = Property.query.get_or_404(property_id)
        
        # Check if user already reviewed this property
        existing_review = Review.query.filter_by(
            user_id=user_id, 
            property_id=property_id
        ).first()
        
        if existing_review:
            return jsonify({'error': 'You have already reviewed this property'}), 400
        
        # Validate required fields
        if not data.get('overall_rating') or int(data.get('overall_rating')) < 1:
            return jsonify({'error': 'Overall rating is required'}), 400
            
        if not data.get('review_text') or len(data.get('review_text').strip()) < 50:
            return jsonify({'error': 'Review text must be at least 50 characters'}), 400
            
        if data.get('recommend') is None:
            return jsonify({'error': 'Recommendation is required'}), 400
        
        # Create review
        review = Review(
            user_id=user_id,
            property_id=property_id,
            overall_rating=int(data['overall_rating']),
            value_rating=int(data.get('value_rating', 0)) or None,
            location_rating=int(data.get('location_rating', 0)) or None,
            safety_rating=int(data.get('safety_rating', 0)) or None,
            cleanliness_rating=int(data.get('cleanliness_rating', 0)) or None,
            management_rating=int(data.get('management_rating', 0)) or None,
            facilities_rating=int(data.get('facilities_rating', 0)) or None,
            review_text=data['review_text'].strip(),
            pros=data.get('pros', '').strip() or None,
            cons=data.get('cons', '').strip() or None,
            recommend=bool(data['recommend']),
            anonymous=bool(data.get('anonymous', False))
        )
        
        db.session.add(review)
        db.session.commit()
        
        # Return review dict manually
        review_dict = {
            'id': review.id,
            'user_id': review.user_id,
            'property_id': review.property_id,
            'overall_rating': review.overall_rating,
            'review_text': review.review_text,
            'recommend': review.recommend,
            'anonymous': review.anonymous,
            'created_at': review.created_at.isoformat() if review.created_at else None
        }
        
        return jsonify({
            'message': 'Review created successfully',
            'review': review_dict
        }), 201
        
    except Exception as e:
        print(f"Error creating review: {e}")
        db.session.rollback()
        return jsonify({'error': 'Failed to create review'}), 500

@reviews_bp.route('/<int:review_id>/helpful', methods=['POST'])
@jwt_required()
def mark_helpful(review_id):
    try:
        review = Review.query.get_or_404(review_id)
        review.helpful_count = (review.helpful_count or 0) + 1
        db.session.commit()
        
        return jsonify({
            'message': 'Review marked as helpful',
            'helpful_count': review.helpful_count
        }), 200
        
    except Exception as e:
        print(f"Error marking review helpful: {e}")
        return jsonify({'error': 'Failed to mark review as helpful'}), 500
    
@reviews_bp.route('/user/stats', methods=['GET'])
@jwt_required()
def get_user_review_stats():
    try:
        user_id = get_jwt_identity()
        
        # Get user's reviews
        user_reviews = Review.query.filter_by(user_id=user_id).all()
        
        # Calculate stats
        review_count = len(user_reviews)
        avg_rating = 0
        total_helpful = 0
        
        if review_count > 0:
            # Calculate average rating
            total_rating = sum(review.overall_rating for review in user_reviews)
            avg_rating = total_rating / review_count
            
            # Calculate total helpful votes
            total_helpful = sum(review.helpful_count or 0 for review in user_reviews)
        
        # Get recent reviews with property info
        recent_reviews = []
        for review in user_reviews[-3:]:  # Get last 3 reviews
            property_obj = Property.query.get(review.property_id)
            recent_reviews.append({
                'id': review.id,
                'property_name': property_obj.name if property_obj else 'Unknown Property',
                'property_id': review.property_id,
                'overall_rating': review.overall_rating,
                'review_text': review.review_text[:100] + '...' if len(review.review_text) > 100 else review.review_text,
                'created_at': review.created_at.isoformat() if review.created_at else None,
                'helpful_count': review.helpful_count or 0
            })
        
        return jsonify({
            'stats': {
                'reviewsCount': review_count,
                'avgRating': round(avg_rating, 1),
                'helpfulVotes': total_helpful
            },
            'recent_reviews': recent_reviews
        }), 200
        
    except Exception as e:
        print(f"Error fetching user review stats: {e}")
        return jsonify({'error': 'Failed to fetch review stats'}), 500