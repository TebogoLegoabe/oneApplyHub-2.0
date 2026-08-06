import logging

from flask import Blueprint, jsonify

from app.models import Bursary

logger = logging.getLogger(__name__)
bursaries_bp = Blueprint('bursaries', __name__)


@bursaries_bp.route('', methods=['GET'])
@bursaries_bp.route('/', methods=['GET'])
def get_bursaries():
    try:
        bursaries = Bursary.query.order_by(Bursary.deadline.asc()).all()
    except Exception:
        logger.exception('Failed to fetch bursaries')
        return jsonify({'error': 'Failed to fetch bursaries'}), 500

    return jsonify({'bursaries': [b.to_dict() for b in bursaries]}), 200
