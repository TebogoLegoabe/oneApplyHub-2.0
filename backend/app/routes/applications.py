import json
import logging

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app import db
from app.models.application import Application, _gen_reference

logger = logging.getLogger(__name__)
applications_bp = Blueprint('applications', __name__)


@applications_bp.route('', methods=['POST'])
@jwt_required()
def submit_application():
    user_id = int(get_jwt_identity())

    existing = Application.query.filter_by(user_id=user_id).first()
    if existing:
        return jsonify({
            'error': 'You have already submitted an application.',
            'application': existing.to_dict(),
        }), 409

    data = request.get_json(silent=True) or {}

    required = ['firstName', 'lastName', 'idNumber', 'university', 'studentNumber']
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({'error': f'Missing required fields: {", ".join(missing)}'}), 400

    # Ensure unique reference
    ref = _gen_reference()
    while Application.query.filter_by(reference=ref).first():
        ref = _gen_reference()

    application = Application(
        user_id=user_id,
        reference=ref,
        first_name=data['firstName'].strip(),
        last_name=data['lastName'].strip(),
        university=data.get('university', ''),
        student_number=data.get('studentNumber', ''),
        form_data=json.dumps(data),
        status='pending',
    )

    try:
        db.session.add(application)
        db.session.commit()
    except Exception:
        logger.exception('Failed to save application for user %s', user_id)
        db.session.rollback()
        return jsonify({'error': 'Failed to save application. Please try again.'}), 500

    return jsonify({
        'message': 'Application submitted successfully.',
        'application': application.to_dict(),
    }), 201


@applications_bp.route('/my', methods=['GET'])
@jwt_required()
def get_my_application():
    user_id = int(get_jwt_identity())
    application = Application.query.filter_by(user_id=user_id).first()
    if not application:
        return jsonify({'application': None}), 200
    return jsonify({'application': application.to_dict(include_form_data=True)}), 200
