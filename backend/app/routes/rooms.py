import csv
import io
import logging

from flask import Blueprint, Response, jsonify, request
from flask_jwt_extended import get_jwt_identity

from app import db
from app.models import (
    AccommodationApplicationProperty,
    Floor,
    Property,
    Room,
    RoomAllocation,
)
from app.models.room import ROOM_CAPACITY, ROOM_TYPES
from app.routes.admin import _assigned_property_ids, _can_manage_property, _current_admin, admin_required
from app.utils import utcnow

logger = logging.getLogger(__name__)
rooms_bp = Blueprint('rooms', __name__)


def _require_property_access(property_id):
    current = _current_admin()
    prop = db.session.get(Property, property_id)
    if not prop:
        return None, (jsonify({'error': 'Property not found'}), 404)
    if not _can_manage_property(current, property_id):
        return None, (jsonify({'error': 'You can only manage assigned properties'}), 403)
    return prop, None


def _active_allocation_count(room_id):
    return RoomAllocation.query.filter_by(room_id=room_id, status='active').count()


@rooms_bp.route('/properties/<int:property_id>/floors', methods=['GET'])
@admin_required
def list_floors(property_id):
    _, error = _require_property_access(property_id)
    if error:
        return error
    floors = Floor.query.filter_by(property_id=property_id).order_by(Floor.floor_number).all()
    return jsonify({'floors': [f.to_dict(include_rooms=True) for f in floors]}), 200


@rooms_bp.route('/properties/<int:property_id>/floors', methods=['POST'])
@admin_required
def create_floor(property_id):
    _, error = _require_property_access(property_id)
    if error:
        return error
    data = request.get_json(silent=True) or {}
    try:
        floor_number = int(data.get('floor_number'))
    except (TypeError, ValueError):
        return jsonify({'error': 'A numeric floor_number is required'}), 400
    if Floor.query.filter_by(property_id=property_id, floor_number=floor_number).first():
        return jsonify({'error': f'Floor {floor_number} already exists for this property'}), 409

    floor = Floor(property_id=property_id, floor_number=floor_number, label=(data.get('label') or '').strip() or None)
    try:
        db.session.add(floor)
        db.session.commit()
    except Exception:
        logger.exception('Failed to create floor for property %s', property_id)
        db.session.rollback()
        return jsonify({'error': 'Failed to create floor'}), 500
    return jsonify({'floor': floor.to_dict()}), 201


@rooms_bp.route('/floors/<int:floor_id>', methods=['PATCH'])
@admin_required
def update_floor(floor_id):
    floor = db.session.get(Floor, floor_id)
    if not floor:
        return jsonify({'error': 'Floor not found'}), 404
    if not _can_manage_property(_current_admin(), floor.property_id):
        return jsonify({'error': 'You can only manage assigned properties'}), 403
    data = request.get_json(silent=True) or {}
    if 'label' in data:
        floor.label = (data.get('label') or '').strip() or None
    if 'floor_number' in data:
        try:
            floor.floor_number = int(data['floor_number'])
        except (TypeError, ValueError):
            return jsonify({'error': 'floor_number must be numeric'}), 400
    try:
        db.session.commit()
    except Exception:
        logger.exception('Failed to update floor %s', floor_id)
        db.session.rollback()
        return jsonify({'error': 'A floor with that number already exists for this property'}), 409
    return jsonify({'floor': floor.to_dict()}), 200


@rooms_bp.route('/floors/<int:floor_id>', methods=['DELETE'])
@admin_required
def delete_floor(floor_id):
    floor = db.session.get(Floor, floor_id)
    if not floor:
        return jsonify({'error': 'Floor not found'}), 404
    if not _can_manage_property(_current_admin(), floor.property_id):
        return jsonify({'error': 'You can only manage assigned properties'}), 403
    occupied = any(_active_allocation_count(room.id) > 0 for room in floor.rooms)
    if occupied:
        return jsonify({'error': 'Vacate every room on this floor before deleting it'}), 400
    db.session.delete(floor)
    db.session.commit()
    return jsonify({'message': 'Floor deleted'}), 200


@rooms_bp.route('/properties/<int:property_id>/rooms', methods=['GET'])
@admin_required
def list_rooms(property_id):
    _, error = _require_property_access(property_id)
    if error:
        return error
    rooms = Room.query.filter_by(property_id=property_id).order_by(Room.room_number).all()
    return jsonify({'rooms': [r.to_dict(include_occupants=True) for r in rooms]}), 200


@rooms_bp.route('/properties/<int:property_id>/rooms', methods=['POST'])
@admin_required
def create_room(property_id):
    _, error = _require_property_access(property_id)
    if error:
        return error
    data = request.get_json(silent=True) or {}
    room_number = str(data.get('room_number', '')).strip()
    room_type = data.get('room_type')
    floor_id = data.get('floor_id')

    if not room_number:
        return jsonify({'error': 'A room number is required'}), 400
    if room_type not in ROOM_TYPES:
        return jsonify({'error': f'room_type must be one of: {", ".join(ROOM_TYPES)}'}), 400
    floor = db.session.get(Floor, int(floor_id)) if floor_id else None
    if not floor or floor.property_id != property_id:
        return jsonify({'error': 'A valid floor_id for this property is required'}), 400
    if Room.query.filter_by(property_id=property_id, room_number=room_number).first():
        return jsonify({'error': f'Room {room_number} already exists for this property'}), 409

    price = data.get('price')
    try:
        price = int(price) if price not in (None, '') else None
    except (TypeError, ValueError):
        return jsonify({'error': 'price must be numeric'}), 400

    room = Room(
        property_id=property_id, floor_id=floor.id, room_number=room_number,
        room_type=room_type, capacity=ROOM_CAPACITY[room_type], price=price,
    )
    try:
        db.session.add(room)
        db.session.commit()
    except Exception:
        logger.exception('Failed to create room for property %s', property_id)
        db.session.rollback()
        return jsonify({'error': 'Failed to create room'}), 500
    return jsonify({'room': room.to_dict()}), 201


@rooms_bp.route('/rooms/<int:room_id>', methods=['PATCH'])
@admin_required
def update_room(room_id):
    room = db.session.get(Room, room_id)
    if not room:
        return jsonify({'error': 'Room not found'}), 404
    if not _can_manage_property(_current_admin(), room.property_id):
        return jsonify({'error': 'You can only manage assigned properties'}), 403
    data = request.get_json(silent=True) or {}

    if 'room_number' in data:
        room.room_number = str(data['room_number']).strip()
    if 'room_type' in data:
        if data['room_type'] not in ROOM_TYPES:
            return jsonify({'error': f'room_type must be one of: {", ".join(ROOM_TYPES)}'}), 400
        new_capacity = ROOM_CAPACITY[data['room_type']]
        if _active_allocation_count(room.id) > new_capacity:
            return jsonify({'error': 'This room has more active occupants than the new type allows'}), 400
        room.room_type = data['room_type']
        room.capacity = new_capacity
    if 'price' in data:
        try:
            room.price = int(data['price']) if data['price'] not in (None, '') else None
        except (TypeError, ValueError):
            return jsonify({'error': 'price must be numeric'}), 400

    try:
        db.session.commit()
    except Exception:
        logger.exception('Failed to update room %s', room_id)
        db.session.rollback()
        return jsonify({'error': 'A room with that number already exists for this property'}), 409
    return jsonify({'room': room.to_dict()}), 200


@rooms_bp.route('/rooms/<int:room_id>', methods=['DELETE'])
@admin_required
def delete_room(room_id):
    room = db.session.get(Room, room_id)
    if not room:
        return jsonify({'error': 'Room not found'}), 404
    if not _can_manage_property(_current_admin(), room.property_id):
        return jsonify({'error': 'You can only manage assigned properties'}), 403
    if _active_allocation_count(room.id) > 0:
        return jsonify({'error': 'Vacate this room before deleting it'}), 400
    db.session.delete(room)
    db.session.commit()
    return jsonify({'message': 'Room deleted'}), 200


@rooms_bp.route('/properties/<int:property_id>/unallocated', methods=['GET'])
@admin_required
def list_unallocated(property_id):
    _, error = _require_property_access(property_id)
    if error:
        return error

    allocated_ids = db.session.query(RoomAllocation.accommodation_application_property_id).filter(
        RoomAllocation.status == 'active',
    ).subquery()
    rows = AccommodationApplicationProperty.query.filter(
        AccommodationApplicationProperty.property_id == property_id,
        AccommodationApplicationProperty.status == 'approved',
        ~AccommodationApplicationProperty.id.in_(allocated_ids),
    ).order_by(AccommodationApplicationProperty.created_at).all()

    items = []
    for row in rows:
        application = row.application
        applicant = application.user if application else None
        item = row.to_dict()
        item['room_type_preference'] = application.room_type if application else None
        item['applicant_name'] = applicant.name if applicant else None
        item['applicant_email'] = applicant.email if applicant else None
        items.append(item)
    return jsonify({'unallocated': items}), 200


@rooms_bp.route('/rooms/<int:room_id>/allocate', methods=['POST'])
@admin_required
def allocate_room(room_id):
    room = db.session.get(Room, room_id)
    if not room:
        return jsonify({'error': 'Room not found'}), 404
    current = _current_admin()
    if not _can_manage_property(current, room.property_id):
        return jsonify({'error': 'You can only manage assigned properties'}), 403

    data = request.get_json(silent=True) or {}
    app_property_id = data.get('accommodation_application_property_id')
    app_property = db.session.get(AccommodationApplicationProperty, int(app_property_id)) if app_property_id else None
    if not app_property or app_property.property_id != room.property_id:
        return jsonify({'error': 'Application not found for this property'}), 404
    if app_property.status != 'approved':
        return jsonify({'error': 'Only approved applicants can be allocated a room'}), 400
    if RoomAllocation.query.filter_by(accommodation_application_property_id=app_property.id, status='active').first():
        return jsonify({'error': 'This applicant already has an active room allocation'}), 409
    if _active_allocation_count(room.id) >= room.capacity:
        return jsonify({'error': 'This room is already at capacity'}), 400

    allocation = RoomAllocation(
        room_id=room.id, accommodation_application_property_id=app_property.id, allocated_by_user_id=current.id,
    )
    try:
        db.session.add(allocation)
        db.session.commit()
    except Exception:
        logger.exception('Failed to allocate room %s', room_id)
        db.session.rollback()
        return jsonify({'error': 'Failed to allocate room'}), 500
    return jsonify({'allocation': allocation.to_dict(), 'room': room.to_dict(include_occupants=True)}), 201


@rooms_bp.route('/properties/<int:property_id>/auto-allocate', methods=['POST'])
@admin_required
def auto_allocate(property_id):
    _, error = _require_property_access(property_id)
    if error:
        return error
    current = _current_admin()

    allocated_ids = db.session.query(RoomAllocation.accommodation_application_property_id).filter(
        RoomAllocation.status == 'active',
    ).subquery()
    pending = AccommodationApplicationProperty.query.filter(
        AccommodationApplicationProperty.property_id == property_id,
        AccommodationApplicationProperty.status == 'approved',
        ~AccommodationApplicationProperty.id.in_(allocated_ids),
    ).order_by(AccommodationApplicationProperty.created_at).all()
    rooms = Room.query.filter_by(property_id=property_id).order_by(Room.room_number).all()

    allocated, skipped = [], []
    for app_property in pending:
        room_type = app_property.application.room_type if app_property.application else None
        room = next((r for r in rooms if r.room_type == room_type and _active_allocation_count(r.id) < r.capacity), None)
        if not room:
            skipped.append(app_property.id)
            continue
        db.session.add(RoomAllocation(room_id=room.id, accommodation_application_property_id=app_property.id, allocated_by_user_id=current.id))
        allocated.append(app_property.id)

    try:
        db.session.commit()
    except Exception:
        logger.exception('Failed to auto-allocate rooms for property %s', property_id)
        db.session.rollback()
        return jsonify({'error': 'Failed to auto-allocate rooms'}), 500
    return jsonify({
        'message': f'Allocated {len(allocated)} room(s), {len(skipped)} could not be matched.',
        'allocated_count': len(allocated), 'skipped_count': len(skipped),
    }), 200


@rooms_bp.route('/allocations/<int:allocation_id>/vacate', methods=['POST'])
@admin_required
def vacate_allocation(allocation_id):
    allocation = db.session.get(RoomAllocation, allocation_id)
    if not allocation:
        return jsonify({'error': 'Allocation not found'}), 404
    if not _can_manage_property(_current_admin(), allocation.room.property_id):
        return jsonify({'error': 'You can only manage assigned properties'}), 403
    allocation.status = 'vacated'
    allocation.vacated_at = utcnow()
    db.session.commit()
    return jsonify({'allocation': allocation.to_dict()}), 200


@rooms_bp.route('/rooms/export', methods=['GET'])
@admin_required
def export_rooms_csv():
    current = _current_admin()
    property_id = request.args.get('property_id', type=int)

    if property_id:
        if not _can_manage_property(current, property_id):
            return jsonify({'error': 'You can only manage assigned properties'}), 403
        property_ids = [property_id]
    else:
        assigned = _assigned_property_ids(current)
        if assigned is None:
            property_ids = [p.id for p in Property.query.all()]
        elif assigned:
            property_ids = assigned
        else:
            return jsonify({'error': 'No assigned properties to export'}), 400

    rooms = Room.query.filter(Room.property_id.in_(property_ids)).order_by(Room.property_id, Room.room_number).all()

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(['Property', 'Floor', 'Room Number', 'Room Type', 'Capacity', 'Occupied', 'Occupant Name', 'Occupant Email', 'Allocated At'])
    for room in rooms:
        active = room.active_allocations()
        property_name = db.session.get(Property, room.property_id).name
        floor_label = room.floor.label or str(room.floor.floor_number)
        if not active:
            writer.writerow([property_name, floor_label, room.room_number, room.room_type, room.capacity, 0, '', '', ''])
        for allocation in active:
            data = allocation.to_dict()
            writer.writerow([property_name, floor_label, room.room_number, room.room_type, room.capacity, len(active), data['applicant_name'], data['applicant_email'], data['allocated_at']])

    response = Response(buffer.getvalue(), mimetype='text/csv')
    response.headers['Content-Disposition'] = 'attachment; filename=room_allocations.csv'
    return response
