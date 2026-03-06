from flask import Blueprint, request, jsonify
from models import db
from models.dashboard_config import DashboardConfig
from models.user import User
from models.sensor_data import SensorData
from models.emotion_log import EmotionLog
from models.behavioral_event import BehavioralEvent
from models.intervention import Intervention
from models.atec_record import ATECRecord
from models.sensory_profile import SensoryProfile
from services.llm_service import llm_generator
from routes.auth import token_required, role_required
from datetime import datetime, timezone, timedelta
from sqlalchemy import func

dashboard_bp = Blueprint('dashboard', __name__)


def build_patient_summary(patient_id):
    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)

    patient = User.query.get(patient_id)
    profile = SensoryProfile.query.filter_by(patient_id=patient_id).first()

    sensor_readings = SensorData.query.filter(
        SensorData.patient_id == patient_id,
        SensorData.timestamp >= week_ago
    ).all()
    eds_values = [s.eds for s in sensor_readings if s.eds is not None]
    avg_eds = round(sum(eds_values) / len(eds_values), 1) if eds_values else 0

    if len(eds_values) >= 2:
        mid = len(eds_values) // 2
        first = sum(eds_values[:mid]) / mid
        second = sum(eds_values[mid:]) / (len(eds_values) - mid)
        diff = second - first
        eds_trend = 'worsening' if diff > 3 else ('improving' if diff < -3 else 'stable')
    else:
        eds_trend = 'stable'

    emotions = EmotionLog.query.filter(
        EmotionLog.patient_id == patient_id,
        EmotionLog.timestamp >= week_ago
    ).all()
    emoji_counts = {}
    for e in emotions:
        emoji_counts[e.emoji_name] = emoji_counts.get(e.emoji_name, 0) + 1
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

    return {
        'patient_code': patient.code if patient else f'PAT_{patient_id}',
        'protocol': profile.protocol if profile else 'cbt',
        'eds_7day_avg': avg_eds,
        'eds_trend': eds_trend,
        'top_emotions': [{'emoji': e[0], 'count': e[1]} for e in top_emotions],
        'behavioral_events': event_counts,
        'intervention_acceptance_rate': iar,
        'atec_total': latest_atec.total if latest_atec else None,
        'atec_subscales': {
            's1': latest_atec.subscale_1 if latest_atec else None,
            's2': latest_atec.subscale_2 if latest_atec else None,
            's3': latest_atec.subscale_3 if latest_atec else None,
            's4': latest_atec.subscale_4 if latest_atec else None,
        } if latest_atec else {},
        'sensory_profile': profile.to_dict() if profile else {},
    }


@dashboard_bp.route('/generate', methods=['POST'])
@token_required
@role_required('therapist')
def generate_dashboard(current_user):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    patient_id = data.get('patient_id')
    if not patient_id:
        return jsonify({'error': 'patient_id required'}), 400

    selected_parameters = data.get('selected_parameters')
    patient_summary = build_patient_summary(patient_id)
    dashboard_data = llm_generator.generate_dashboard(patient_summary, selected_parameters)

    DashboardConfig.query.filter_by(
        patient_id=patient_id, is_active=True
    ).update({'is_active': False})

    config = DashboardConfig(
        therapist_id=current_user.id,
        patient_id=patient_id,
        parameters=dashboard_data.get('selected_parameters', []),
        llm_config=dashboard_data,
        chart_config=dashboard_data.get('charts', []),
        narrative_text=dashboard_data.get('narrative', ''),
        is_active=True,
    )
    db.session.add(config)
    db.session.commit()

    result = config.to_dict()
    result['dashboard'] = dashboard_data
    return jsonify(result), 201


@dashboard_bp.route('/<int:patient_id>/active', methods=['GET'])
@token_required
def get_active_dashboard(current_user, patient_id):
    config = DashboardConfig.query.filter_by(
        patient_id=patient_id, is_active=True
    ).order_by(DashboardConfig.generated_at.desc()).first()

    if not config:
        return jsonify({'error': 'No active dashboard'}), 404

    result = config.to_dict()
    result['dashboard'] = config.llm_config
    return jsonify(result)


@dashboard_bp.route('/custom', methods=['POST'])
@token_required
@role_required('therapist')
def save_custom_dashboard(current_user):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    patient_id = data.get('patient_id')
    if not patient_id:
        return jsonify({'error': 'patient_id required'}), 400

    DashboardConfig.query.filter_by(
        patient_id=patient_id, is_active=True
    ).update({'is_active': False})

    config = DashboardConfig(
        therapist_id=current_user.id,
        patient_id=patient_id,
        parameters=data.get('parameters', []),
        llm_config=data.get('llm_config', {}),
        chart_config=data.get('chart_config', []),
        narrative_text=data.get('narrative_text', ''),
        is_active=True,
    )
    db.session.add(config)
    db.session.commit()
    return jsonify(config.to_dict()), 201
