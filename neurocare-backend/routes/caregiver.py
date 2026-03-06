from flask import Blueprint, request, jsonify
from models import db
from models.behavioral_event import BehavioralEvent
from models.caregiver_log import CaregiverDailyLog
from routes.auth import token_required, role_required
from datetime import datetime, timezone

caregiver_bp = Blueprint('caregiver', __name__)


@caregiver_bp.route('/behavioral-event', methods=['POST'])
@token_required
def log_behavioral_event(current_user):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    patient_id = data.get('patient_id')
    if not patient_id:
        return jsonify({'error': 'patient_id required'}), 400

    event = BehavioralEvent(
        patient_id=patient_id,
        logged_by=current_user.id,
        event_type=data.get('event_type', 'meltdown'),
        severity=max(1, min(4, data.get('severity', 1))),
        duration_seconds=data.get('duration_seconds'),
        location=data.get('location'),
        activity=data.get('activity'),
        social_setting=data.get('social_setting'),
        noise_level=data.get('noise_level'),
        lighting_level=data.get('lighting_level'),
        screen_time_minutes=data.get('screen_time_minutes'),
        notes=data.get('notes'),
    )
    db.session.add(event)
    db.session.commit()
    return jsonify(event.to_dict()), 201


@caregiver_bp.route('/daily-log', methods=['POST'])
@token_required
def submit_daily_log(current_user):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    patient_id = data.get('patient_id')
    if not patient_id:
        return jsonify({'error': 'patient_id required'}), 400

    log = CaregiverDailyLog(
        patient_id=patient_id,
        caregiver_id=current_user.id,
        date=datetime.now(timezone.utc).date(),
        sleep_hours=data.get('sleep_hours'),
        sleep_quality=data.get('sleep_quality'),
        meals_regular=data.get('meals_regular', True),
        diet_notes=data.get('diet_notes'),
        medication_taken=data.get('medication_taken', False),
        medication_notes=data.get('medication_notes'),
        mood_morning=data.get('mood_morning'),
        mood_afternoon=data.get('mood_afternoon'),
        mood_evening=data.get('mood_evening'),
        meltdown_count=data.get('meltdown_count', 0),
        stimming_level=data.get('stimming_level'),
        social_engagement=data.get('social_engagement'),
        physical_activity_minutes=data.get('physical_activity_minutes', 0),
        daily_summary=data.get('daily_summary'),
    )
    db.session.add(log)
    db.session.commit()
    return jsonify(log.to_dict()), 201


@caregiver_bp.route('/daily-log/<int:patient_id>', methods=['GET'])
@token_required
def get_daily_logs(current_user, patient_id):
    limit = request.args.get('limit', 30, type=int)
    logs = CaregiverDailyLog.query.filter_by(patient_id=patient_id).order_by(
        CaregiverDailyLog.date.desc()).limit(limit).all()
    return jsonify({'logs': [l.to_dict() for l in logs]})
