import logging
import math

from flask import Blueprint, request, jsonify
from sqlalchemy import func, or_

from app import db
from app.models import Property, PropertyImage, Review
from app.utils.geo import haversine_km

logger = logging.getLogger(__name__)
properties_bp = Blueprint('properties', __name__)

_MAX_PER_PAGE = 50
_MAX_NEARBY = 12
_SORTS = ('recommended', 'distance', 'price_asc', 'price_desc', 'rating', 'name')


# --------------------------------------------------------------------------- helpers

def _float_arg(name, low, high):
    raw = request.args.get(name, '').strip()
    if not raw:
        return None
    try:
        value = float(raw)
    except ValueError:
        return None
    return value if math.isfinite(value) and low <= value <= high else None


def _origin():
    """The point distances are measured from (a campus or the student's location), if given."""
    lat = _float_arg('near_lat', -90, 90)
    lng = _float_arg('near_lng', -180, 180)
    return (lat, lng) if lat is not None and lng is not None else None


def _filtered_query():
    university = request.args.get('university')
    property_type = request.args.get('type')
    min_price = request.args.get('min_price', type=int)
    max_price = request.args.get('max_price', type=int)
    search = request.args.get('search', '').strip()
    nsfas = request.args.get('nsfas', '').lower() in ('1', 'true', 'yes')

    query = Property.query.filter(Property.approved.is_(True))
    if university and university != 'all':
        query = query.filter(or_(Property.university == university, Property.university == 'both'))
    if property_type and property_type != 'all':
        query = query.filter(Property.property_type == property_type)
    if min_price:
        query = query.filter(Property.price_min >= min_price)
    if max_price:
        query = query.filter(Property.price_max <= max_price)
    if nsfas:
        query = query.filter(Property.nsfas_accredited.is_(True))
    if search:
        term = f'%{search}%'
        query = query.filter(or_(Property.name.ilike(term), Property.address.ilike(term)))
    return query


def _rating_stats(property_ids):
    """{property_id: (average_rating, review_count)} for approved reviews, in one query."""
    if not property_ids:
        return {}
    rows = (
        db.session.query(Review.property_id, func.avg(Review.overall_rating), func.count(Review.id))
        .filter(Review.property_id.in_(property_ids), Review.approved.is_(True))
        .group_by(Review.property_id)
        .all()
    )
    return {pid: (round(float(avg), 1) if avg else 0.0, count) for pid, avg, count in rows}


def _primary_images(property_ids):
    """{property_id: image_url} — the primary (or oldest) image per property, in one query."""
    if not property_ids:
        return {}
    images = (
        PropertyImage.query.filter(PropertyImage.property_id.in_(property_ids))
        .order_by(PropertyImage.property_id, PropertyImage.is_primary.desc(), PropertyImage.created_at.asc())
        .all()
    )
    result = {}
    for image in images:
        result.setdefault(image.property_id, image.image_url)
    return result


def _distance(prop, origin):
    if origin is None or not prop.has_location:
        return None
    return round(haversine_km(origin[0], origin[1], prop.latitude, prop.longitude), 3)


def _rank(properties, origin, max_km, sort):
    """Annotate with distance and ratings, apply the radius filter, then sort.

    Returns a list of (property, distance_km, (average_rating, review_count)).
    """
    stats = _rating_stats([prop.id for prop in properties])
    rows = []
    for prop in properties:
        distance = _distance(prop, origin)
        if origin is not None and max_km is not None and (distance is None or distance > max_km):
            continue
        rows.append((prop, distance, stats.get(prop.id, (0.0, 0))))

    if sort == 'recommended':
        sort = 'distance' if origin is not None else 'rating'
    if sort == 'distance' and origin is None:
        sort = 'rating'

    def name_key(row):
        return row[0].name.lower()

    keys = {
        # Properties without a pin go last when sorting by distance.
        'distance': lambda row: (row[1] is None, row[1] if row[1] is not None else 0, name_key(row)),
        'price_asc': lambda row: (row[0].price_min is None, row[0].price_min or 0, name_key(row)),
        'price_desc': lambda row: (row[0].price_max is None, -(row[0].price_max or 0), name_key(row)),
        'rating': lambda row: (-row[2][0], -row[2][1], name_key(row)),
        'name': name_key,
    }
    rows.sort(key=keys.get(sort, keys['rating']))
    return rows


def _map_point(prop, distance, stats, image_url):
    """Compact representation for map markers and 'nearby' lists."""
    return {
        'id': prop.id,
        'name': prop.name,
        'address': prop.address,
        'latitude': prop.latitude,
        'longitude': prop.longitude,
        'geo_precision': prop.geo_precision,
        'property_type': prop.property_type,
        'university': prop.university,
        'nsfas_accredited': prop.nsfas_accredited,
        'price_min': prop.price_min,
        'price_max': prop.price_max,
        'average_rating': stats[0],
        'review_count': stats[1],
        'primary_image_url': image_url,
        'distance_km': distance,
    }


def _sort_arg():
    sort = request.args.get('sort', 'recommended')
    return sort if sort in _SORTS else 'recommended'


# --------------------------------------------------------------------------- routes

@properties_bp.route('', methods=['GET'])
@properties_bp.route('/', methods=['GET'])
def get_properties():
    page = max(1, request.args.get('page', 1, type=int))
    per_page = max(1, min(request.args.get('per_page', 12, type=int), _MAX_PER_PAGE))
    origin = _origin()
    max_km = _float_arg('max_km', 0.05, 500)

    try:
        rows = _rank(_filtered_query().all(), origin, max_km, _sort_arg())
    except Exception:
        logger.exception('Failed to fetch properties')
        return jsonify({'error': 'Failed to fetch properties'}), 500

    total = len(rows)
    start = (page - 1) * per_page
    items = []
    for prop, distance, stats in rows[start:start + per_page]:
        data = prop.to_dict(rating_stats=stats)
        data['distance_km'] = distance
        items.append(data)

    return jsonify({
        'properties': items,
        'total': total,
        'pages': max(1, math.ceil(total / per_page)) if total else 0,
        'current_page': page,
    }), 200


@properties_bp.route('/map', methods=['GET'])
def get_property_map():
    """Every matching property with a map pin — no pagination — for the map view."""
    origin = _origin()
    max_km = _float_arg('max_km', 0.05, 500)
    try:
        rows = _rank(_filtered_query().all(), origin, max_km, _sort_arg())
    except Exception:
        logger.exception('Failed to fetch property map')
        return jsonify({'error': 'Failed to fetch properties'}), 500

    located = [row for row in rows if row[0].has_location]
    images = _primary_images([prop.id for prop, _, _ in located])
    return jsonify({
        'properties': [_map_point(prop, distance, stats, images.get(prop.id)) for prop, distance, stats in located],
        'total': len(rows),
        'unmapped': len(rows) - len(located),
    }), 200


@properties_bp.route('/<int:property_id>', methods=['GET'])
def get_property(property_id):
    prop = db.session.get(Property, property_id)
    if not prop or not prop.approved:
        return jsonify({'error': 'Property not found'}), 404
    return jsonify({'property': prop.to_dict()}), 200


@properties_bp.route('/<int:property_id>/nearby', methods=['GET'])
def get_nearby_properties(property_id):
    """Closest other approved properties to this one, nearest first."""
    prop = db.session.get(Property, property_id)
    if not prop or not prop.approved:
        return jsonify({'error': 'Property not found'}), 404
    if not prop.has_location:
        return jsonify({'properties': []}), 200

    limit = max(1, min(request.args.get('limit', 6, type=int), _MAX_NEARBY))
    others = Property.query.filter(
        Property.approved.is_(True),
        Property.id != prop.id,
        Property.latitude.isnot(None),
        Property.longitude.isnot(None),
    ).all()
    origin = (prop.latitude, prop.longitude)
    closest = sorted(others, key=lambda other: _distance(other, origin))[:limit]
    ids = [other.id for other in closest]
    stats = _rating_stats(ids)
    images = _primary_images(ids)
    return jsonify({
        'properties': [
            _map_point(other, _distance(other, origin), stats.get(other.id, (0.0, 0)), images.get(other.id))
            for other in closest
        ],
    }), 200
