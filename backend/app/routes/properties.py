import logging

from flask import Blueprint, request, jsonify
from sqlalchemy import or_

from app import db
from app.models import Property

logger = logging.getLogger(__name__)
properties_bp = Blueprint('properties', __name__)

_MAX_PER_PAGE = 50


@properties_bp.route('', methods=['GET'])
@properties_bp.route('/', methods=['GET'])
def get_properties():
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 12, type=int), _MAX_PER_PAGE)
    university = request.args.get('university')
    property_type = request.args.get('type')
    min_price = request.args.get('min_price', type=int)
    max_price = request.args.get('max_price', type=int)
    search = request.args.get('search', '').strip()

    query = Property.query.filter_by(approved=True)

    if university and university != 'all':
        query = query.filter(
            or_(Property.university == university, Property.university == 'both')
        )
    if property_type and property_type != 'all':
        query = query.filter(Property.property_type == property_type)
    if min_price:
        query = query.filter(Property.price_min >= min_price)
    if max_price:
        query = query.filter(Property.price_max <= max_price)
    if search:
        term = f'%{search}%'
        query = query.filter(
            or_(Property.name.ilike(term), Property.address.ilike(term))
        )

    try:
        results = query.paginate(page=page, per_page=per_page, error_out=False)
    except Exception:
        logger.exception('Failed to fetch properties')
        return jsonify({'error': 'Failed to fetch properties'}), 500

    return jsonify({
        'properties': [p.to_dict() for p in results.items],
        'total': results.total,
        'pages': results.pages,
        'current_page': page,
    }), 200


@properties_bp.route('/<int:property_id>', methods=['GET'])
def get_property(property_id):
    prop = db.session.get(Property, property_id)
    if not prop or not prop.approved:
        return jsonify({'error': 'Property not found'}), 404
    return jsonify({'property': prop.to_dict()}), 200
