from flask import Blueprint, request, jsonify
from models import db
from models.user import User
from models.sensor_data import SensorData
from models.emotion_log import EmotionLog
from models.behavioral_event import BehavioralEvent
from models.intervention import Intervention
from models.atec_record import ATECRecord
from models.sensory_profile import SensoryProfile
from routes.auth import token_required, role_required
from datetime import datetime, timezone, timedelta
from sqlalchemy import func

patients_bp = Blueprint('patients', __name__)


@patients_bp.route('', methods=['GET'])
@token_required
def list_patients(current_user):
    if current_user.role == 'therapist':
        assigned = current_user.assigned_patients or []
        if assigned:
            patients = User.query.filter(User.id.in_(assigned), User.role == 'patient').all()
        else:
            patients = User.query.filter_by(role='patient').all()
    elif current_user.role == 'caregiver':
        assigned = current_user.assigned_patients or []
        patients = User.query.filter(User.id.in_(assigned), User.role == 'patient').all() if assigned else []
    elif current_user.role == 'patient':
        patients = [current_user]
    else:
        patients = []
    return jsonify({'patients': [p.to_dict() for p in patients]})


@patients_bp.route('/<int:patient_id>', methods=['GET'])
@token_required
def get_patient(current_user, patient_id):
    patient = User.query.filter_by(id=patient_id, role='patient').first()
    if not patient:
        return jsonify({'error': 'Patient not found'}), 404

    profile = SensoryProfile.query.filter_by(patient_id=patient_id).first()
    result = patient.to_dict()
    result['sensory_profile'] = profile.to_dict() if profile else None
    return jsonify(result)


@patients_bp.route('/<int:patient_id>/summary', methods=['GET'])
@token_required
def patient_summary(current_user, patient_id):
    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)

    sensor_readings = SensorData.query.filter(
        SensorData.patient_id == patient_id,
        SensorData.timestamp >= week_ago
    ).all()

    eds_values = [s.eds for s in sensor_readings if s.eds is not None]
    avg_eds = round(sum(eds_values) / len(eds_values), 1) if eds_values else 0
    elevated_count = sum(1 for e in eds_values if e >= 55)
    elevated_pct = round(elevated_count / len(eds_values), 3) if eds_values else 0

    if len(eds_values) >= 2:
        mid = len(eds_values) // 2
        first_half = sum(eds_values[:mid]) / mid
        second_half = sum(eds_values[mid:]) / (len(eds_values) - mid)
        diff = second_half - first_half
        if diff > 3:
            eds_trend = 'worsening'
        elif diff < -3:
            eds_trend = 'improving'
        else:
            eds_trend = 'stable'
    else:
        eds_trend = 'stable'

    emotions = EmotionLog.query.filter(
        EmotionLog.patient_id == patient_id,
        EmotionLog.timestamp >= week_ago
    ).all()

    emoji_counts = {}
    for e in emotions:
        key = e.emoji_name
        emoji_counts[key] = emoji_counts.get(key, 0) + 1
    top_emotions = sorted(emoji_counts.items(), key=lambda x: -x[1])[:3]

    events = BehavioralEvent.query.filter(
        BehavioralEvent.patient_id == patient_id,
        BehavioralEvent.timestamp >= week_ago
    ).all()
    event_counts = {}
    for ev in events:
        event_counts[ev.event_type] = event_counts.get(ev.event_type, 0) + 1

    interventions = Intervention.query.filter(
        Intervention.patient_id == patient_id,
        Intervention.timestamp >= week_ago
    ).all()
    total_int = len(interventions)
    accepted = sum(1 for i in interventions if i.outcome in ('accepted', 'completed'))
    iar = round((accepted / total_int * 100), 1) if total_int > 0 else 0

    latest_atec = ATECRecord.query.filter_by(patient_id=patient_id).order_by(
        ATECRecord.date.desc()).first()

    profile = SensoryProfile.query.filter_by(patient_id=patient_id).first()

    return jsonify({
        'patient_id': patient_id,
        'eds_7day_avg': avg_eds,
        'eds_trend': eds_trend,
        'elevated_pct': elevated_pct,
        'top_emotions': [{'emoji': e[0], 'count': e[1]} for e in top_emotions],
        'total_emotions': len(emotions),
        'behavioral_events': event_counts,
        'intervention_acceptance_rate': iar,
        'total_interventions': total_int,
        'atec_latest': latest_atec.to_dict() if latest_atec else None,
        'sensory_profile': profile.to_dict() if profile else None,
        'readings_count': len(sensor_readings),
    })


@patients_bp.route('/<int:patient_id>/live', methods=['GET'])
@token_required
def patient_live(current_user, patient_id):
    latest = SensorData.query.filter_by(patient_id=patient_id).order_by(
        SensorData.timestamp.desc()).first()
    if not latest:
        return jsonify({'error': 'No sensor data'}), 404
    return jsonify(latest.to_dict())
