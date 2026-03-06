from flask import Blueprint, request, jsonify
from models import db
from models.therapist_note import TherapistNote
from models.sensory_profile import SensoryProfile
from routes.auth import token_required, role_required

llm_dashboard_bp = Blueprint('therapist', __name__)


@llm_dashboard_bp.route('/notes', methods=['POST'])
@token_required
@role_required('therapist')
def save_note(current_user):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    patient_id = data.get('patient_id')
    if not patient_id:
        return jsonify({'error': 'patient_id required'}), 400

    note = TherapistNote(
        therapist_id=current_user.id,
        patient_id=patient_id,
        note_text=data.get('note_text', ''),
        linked_event_id=data.get('linked_event_id'),
        note_type=data.get('note_type', 'session'),
    )
    db.session.add(note)
    db.session.commit()
    return jsonify(note.to_dict()), 201


@llm_dashboard_bp.route('/notes/<int:patient_id>', methods=['GET'])
@token_required
def get_notes(current_user, patient_id):
    limit = request.args.get('limit', 50, type=int)
    notes = TherapistNote.query.filter_by(patient_id=patient_id).order_by(
        TherapistNote.timestamp.desc()).limit(limit).all()
    return jsonify({'notes': [n.to_dict() for n in notes]})


@llm_dashboard_bp.route('/sensory-profile/<int:patient_id>', methods=['PUT'])
@token_required
@role_required('therapist')
def update_sensory_profile(current_user, patient_id):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    profile = SensoryProfile.query.filter_by(patient_id=patient_id).first()
    if not profile:
        profile = SensoryProfile(patient_id=patient_id)
        db.session.add(profile)

    for field in ['noise_sensitivity', 'light_sensitivity', 'touch_sensitivity',
                  'texture_sensitivity', 'crowd_sensitivity', 'movement_sensitivity',
                  'temperature_sensitivity', 'intervention_threshold',
                  'resting_hr', 'resting_hrv', 'resting_gsr', 'resting_temp']:
        if field in data:
            setattr(profile, field, data[field])

    if 'preferred_inputs' in data:
        profile.preferred_inputs = data['preferred_inputs']
    if 'protocol' in data and data['protocol'] in ('cbt', 'sensory', 'dbt'):
        profile.protocol = data['protocol']

    db.session.commit()
    return jsonify(profile.to_dict())
