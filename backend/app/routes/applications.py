import logging
import random
import string

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app import db
from app.models import (
    AcademicResult,
    AccommodationApplication,
    AccommodationApplicationProperty,
    ApplicantProfile,
    Property,
    UniversityApplication,
    UniversityApplicationChoice,
)
from app.models.applicant_profile import GRADE_11, GRADE_12_JUNE
from app.utils import utcnow

logger = logging.getLogger(__name__)
applications_bp = Blueprint('applications', __name__)

ALLOWED_DOCUMENT_PREFIXES = (
    'data:image/jpeg;base64,',
    'data:image/jpg;base64,',
    'data:image/png;base64,',
    'data:application/pdf;base64,',
)
MAX_DOCUMENT_CHARS = 7_000_000  # roughly 5 MB after base64 encoding


def _gen_reference():
    chars = string.ascii_uppercase + string.digits
    return 'APP-' + ''.join(random.choices(chars, k=8))


def _unique_reference():
    ref = _gen_reference()
    while (
        AccommodationApplication.query.filter_by(reference=ref).first()
        or UniversityApplication.query.filter_by(reference=ref).first()
    ):
        ref = _gen_reference()
    return ref


def _validate_document(value, field_name):
    if value in (None, ''):
        return None, None
    if not isinstance(value, str):
        return None, f'{field_name} has an invalid format'
    if len(value) > MAX_DOCUMENT_CHARS:
        return None, f'{field_name} is too large. Please upload a file under 5 MB.'
    if not value.startswith(ALLOWED_DOCUMENT_PREFIXES):
        return None, f'{field_name} must be a JPG, PNG, or PDF file.'
    return value, None


def _get_or_create_profile(user_id):
    profile = ApplicantProfile.query.filter_by(user_id=user_id).first()
    if not profile:
        profile = ApplicantProfile(user_id=user_id, first_name='', last_name='')
        db.session.add(profile)
    return profile


def _apply_profile_fields(profile, data):
    first_name = (data.get('firstName') or profile.first_name or '').strip()
    last_name = (data.get('lastName') or profile.last_name or '').strip()
    id_number = (data.get('idNumber') or profile.id_number or '').strip()

    if not first_name or not last_name or not id_number:
        return 'First name, last name, and ID number are required'

    profile.first_name = first_name or profile.first_name
    profile.last_name = last_name or profile.last_name
    profile.id_number = id_number or profile.id_number
    for field, key in (
        ('phone_number', 'phoneNumber'), ('nationality', 'nationality'),
        ('student_number', 'studentNumber'), ('faculty', 'faculty'),
        ('year_of_study', 'yearOfStudy'), ('degree_program', 'degreeProgram'),
        ('financial_aid', 'financialAid'),
        ('parent_guardian_name', 'parentGuardianName'), ('parent_guardian_id_number', 'parentGuardianIdNumber'),
        ('parent_guardian_phone', 'parentGuardianPhone'), ('parent_guardian_email', 'parentGuardianEmail'),
    ):
        if key in data:
            setattr(profile, field, (data.get(key) or '').strip() or None)
    if 'nsfasApplicant' in data:
        profile.nsfas_applicant = bool(data.get('nsfasApplicant'))

    for doc_field, key in (
        ('student_id_document', 'studentIdDocument'),
        ('parent_guardian_id_document', 'parentGuardianIdDocument'),
    ):
        if key in data:
            value, error = _validate_document(data.get(key), key)
            if error:
                return error
            setattr(profile, doc_field, value)

    return None


def _apply_academic_results(profile, grade, results, document_field, document_value):
    if document_value:
        value, error = _validate_document(document_value, document_field)
        if error:
            return error
        setattr(profile, document_field, value)

    if results is None:
        return None
    if not isinstance(results, list):
        return f'Results for {grade} must be a list'

    AcademicResult.query.filter_by(applicant_profile_id=profile.id, grade=grade).delete()
    for entry in results:
        subject = str((entry or {}).get('subject', '')).strip()
        mark = entry.get('mark') if isinstance(entry, dict) else None
        if not subject:
            continue
        try:
            mark = int(mark)
        except (TypeError, ValueError):
            continue
        if not 0 <= mark <= 100:
            continue
        db.session.add(AcademicResult(applicant_profile_id=profile.id, grade=grade, subject=subject, mark=mark))
    return None


@applications_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = int(get_jwt_identity())
    profile = ApplicantProfile.query.filter_by(user_id=user_id).first()
    return jsonify({'profile': profile.to_dict() if profile else None}), 200


@applications_bp.route('/accommodation', methods=['POST'])
@jwt_required()
def submit_accommodation_application():
    user_id = int(get_jwt_identity())

    existing = AccommodationApplication.query.filter_by(user_id=user_id).first()
    if existing:
        return jsonify({
            'error': 'You have already submitted an accommodation application.',
            'application': existing.to_dict(),
        }), 409

    data = request.get_json(silent=True) or {}
    selected = data.get('selectedResidences') or []
    if not isinstance(selected, list) or not selected:
        return jsonify({'error': 'Select at least one property'}), 400
    if len(selected) > 3:
        return jsonify({'error': 'You can select up to 3 properties'}), 400
    try:
        property_ids = [int(p) for p in selected]
    except (TypeError, ValueError):
        return jsonify({'error': 'Invalid property selection'}), 400
    found_properties = Property.query.filter(Property.id.in_(property_ids)).all()
    if len(found_properties) != len(set(property_ids)):
        return jsonify({'error': 'One or more selected properties could not be found'}), 404

    if not data.get('roomType'):
        return jsonify({'error': 'Room type is required'}), 400

    profile = _get_or_create_profile(user_id)
    error = _apply_profile_fields(profile, data)
    if error:
        db.session.rollback()
        return jsonify({'error': error}), 400

    documents = data.get('documents') or {}
    doc_errors = []
    proof_of_registration, err = _validate_document(documents.get('proofOfRegistration'), 'Proof of registration')
    doc_errors.append(err)
    bank_statement, err = _validate_document(documents.get('bankStatement'), 'Bank statement')
    doc_errors.append(err)
    nsfas_letter, err = _validate_document(documents.get('nsfasLetter'), 'NSFAS letter')
    doc_errors.append(err)
    doc_errors = [e for e in doc_errors if e]
    if doc_errors:
        db.session.rollback()
        return jsonify({'error': doc_errors[0]}), 400

    application = AccommodationApplication(
        user_id=user_id,
        reference=_unique_reference(),
        room_type=data.get('roomType'),
        special_requirements=(data.get('specialRequirements') or '').strip() or None,
        proof_of_registration=proof_of_registration,
        bank_statement=bank_statement,
        nsfas_letter=nsfas_letter,
    )

    try:
        db.session.add(application)
        db.session.flush()
        for property_id in property_ids:
            db.session.add(AccommodationApplicationProperty(
                accommodation_application_id=application.id, property_id=property_id,
            ))
        db.session.commit()
    except Exception:
        logger.exception('Failed to save accommodation application for user %s', user_id)
        db.session.rollback()
        return jsonify({'error': 'Failed to save application. Please try again.'}), 500

    return jsonify({
        'message': 'Accommodation application submitted successfully.',
        'application': application.to_dict(),
    }), 201


@applications_bp.route('/accommodation/my', methods=['GET'])
@jwt_required()
def get_my_accommodation_application():
    user_id = int(get_jwt_identity())
    application = AccommodationApplication.query.filter_by(user_id=user_id).first()
    if not application:
        return jsonify({'application': None}), 200
    return jsonify({'application': application.to_dict(include_documents=True)}), 200


@applications_bp.route('/university', methods=['POST'])
@jwt_required()
def submit_university_application():
    user_id = int(get_jwt_identity())

    existing = UniversityApplication.query.filter_by(user_id=user_id).first()
    if existing:
        return jsonify({
            'error': 'You have already submitted a university application.',
            'application': existing.to_dict(),
        }), 409

    data = request.get_json(silent=True) or {}
    choices = data.get('universityChoices') or []
    if not isinstance(choices, list) or not choices:
        return jsonify({'error': 'Select at least one university'}), 400
    if len(choices) > 3:
        return jsonify({'error': 'You can select up to 3 universities'}), 400
    cleaned_choices = []
    for choice in choices:
        university = str((choice or {}).get('university', '')).strip()
        if not university:
            return jsonify({'error': 'Each choice must include a university name'}), 400
        cleaned_choices.append({
            'university': university,
            'programme': str((choice or {}).get('programme', '')).strip() or None,
        })

    profile = _get_or_create_profile(user_id)
    error = _apply_profile_fields(profile, data)
    if error:
        db.session.rollback()
        return jsonify({'error': error}), 400
    db.session.flush()

    for grade, results_key, doc_key in (
        (GRADE_11, 'grade11Results', 'grade11ResultsDocument'),
        (GRADE_12_JUNE, 'grade12JuneResults', 'grade12JuneResultsDocument'),
    ):
        document_field = 'grade11_results_document' if grade == GRADE_11 else 'grade12_june_results_document'
        error = _apply_academic_results(profile, grade, data.get(results_key), document_field, data.get(doc_key))
        if error:
            db.session.rollback()
            return jsonify({'error': error}), 400

    application = UniversityApplication(user_id=user_id, reference=_unique_reference())

    try:
        db.session.add(application)
        db.session.flush()
        for choice in cleaned_choices:
            db.session.add(UniversityApplicationChoice(
                university_application_id=application.id,
                university=choice['university'], programme=choice['programme'],
            ))
        db.session.commit()
    except Exception:
        logger.exception('Failed to save university application for user %s', user_id)
        db.session.rollback()
        return jsonify({'error': 'Failed to save application. Please try again.'}), 500

    return jsonify({
        'message': 'University application submitted successfully.',
        'application': application.to_dict(),
    }), 201


@applications_bp.route('/university/my', methods=['GET'])
@jwt_required()
def get_my_university_application():
    user_id = int(get_jwt_identity())
    application = UniversityApplication.query.filter_by(user_id=user_id).first()
    if not application:
        return jsonify({'application': None}), 200
    return jsonify({'application': application.to_dict()}), 200
