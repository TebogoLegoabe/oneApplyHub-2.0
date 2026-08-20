import logging
from flask import Blueprint, request, jsonify
from sqlalchemy import or_

from app import db
from app.models import Opportunity

logger = logging.getLogger(__name__)
opportunities_bp = Blueprint('opportunities', __name__)

_MAX_PER_PAGE = 50


@opportunities_bp.route('', methods=['GET'])
@opportunities_bp.route('/', methods=['GET'])
def get_opportunities():
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 12, type=int), _MAX_PER_PAGE)
    opportunity_type = request.args.get('type')
    search = request.args.get('search', '').strip()

    query = Opportunity.query.filter_by(status='open')

    if opportunity_type and opportunity_type != 'all':
        query = query.filter(Opportunity.opportunity_type == opportunity_type)
    if search:
        term = f'%{search}%'
        query = query.filter(
            or_(Opportunity.title.ilike(term), Opportunity.provider.ilike(term), Opportunity.description.ilike(term))
        )

    query = query.order_by(Opportunity.deadline.asc())

    try:
        results = query.paginate(page=page, per_page=per_page, error_out=False)
    except Exception:
        logger.exception('Failed to fetch opportunities')
        return jsonify({'error': 'Failed to fetch opportunities'}), 500

    return jsonify({
        'opportunities': [o.to_dict() for o in results.items],
        'total': results.total,
        'pages': results.pages,
        'current_page': page,
    }), 200


@opportunities_bp.route('/<int:opportunity_id>', methods=['GET'])
def get_opportunity(opportunity_id):
    opp = db.session.get(Opportunity, opportunity_id)
    if not opp:
        return jsonify({'error': 'Opportunity not found'}), 404
    return jsonify({'opportunity': opp.to_dict()}), 200
