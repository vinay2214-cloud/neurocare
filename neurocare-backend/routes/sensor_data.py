from flask import Blueprint, request, jsonify
from models import db
from models.sensor_data import SensorData
from services.eds_calculator import EDSCalculator
from routes.auth import token_required
from datetime import datetime, timezone, timedelta
from sqlalchemy import func

sensor_bp = Blueprint('sensor_data', __name__)


@sensor_bp.route('', methods=['POST'])
@token_required
def receive_sensor_reading(current_user):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    patient_id = data.get('patient_id', current_user.id)
    context = {
        'location': data.get('context_location', 'home'),
        'noise_level': data.get('noise_level', 2),
        'crowd_sensitivity_triggered': data.get('crowd_triggered', False),
    }

    eds_result = EDSCalculator.compute(patient_id, data, context=context)

    reading = SensorData(
        patient_id=patient_id,
        hr=data.get('hr'),
        hrv=data.get('hrv'),
        gsr=data.get('gsr'),
        body_temp=data.get('body_temp'),
        motion=data.get('motion'),
        breathing_rate=data.get('breathing_rate'),
        muscle_tension=data.get('muscle_tension'),
        sleep_quality=data.get('sleep_quality'),
        facial_tension=data.get('facial_tension'),
        eye_blink_rate=data.get('eye_blink_rate'),
        eds=eds_result['eds'],
        eds_state=eds_result['eds_state'],
        sensor_mode=data.get('sensor_mode', 'mock'),
    )
    db.session.add(reading)
    db.session.commit()

    result = reading.to_dict()
    result['eds_components'] = eds_result['components']
    return jsonify(result), 201


@sensor_bp.route('/<int:patient_id>/history', methods=['GET'])
@token_required
def sensor_history(current_user, patient_id):
    hours = request.args.get('hours', 24, type=int)
    limit = request.args.get('limit', 500, type=int)
    since = datetime.now(timezone.utc) - timedelta(hours=hours)

    readings = SensorData.query.filter(
        SensorData.patient_id == patient_id,
        SensorData.timestamp >= since
    ).order_by(SensorData.timestamp.desc()).limit(limit).all()

    return jsonify({'readings': [r.to_dict() for r in readings]})


@sensor_bp.route('/<int:patient_id>/stats', methods=['GET'])
@token_required
def sensor_stats(current_user, patient_id):
    days = request.args.get('days', 7, type=int)
    since = datetime.now(timezone.utc) - timedelta(days=days)

    readings = SensorData.query.filter(
        SensorData.patient_id == patient_id,
        SensorData.timestamp >= since
    ).all()

    if not readings:
        return jsonify({'error': 'No data available'}), 404

    eds_values = [r.eds for r in readings if r.eds is not None]
    hr_values = [r.hr for r in readings if r.hr is not None]
    hrv_values = [r.hrv for r in readings if r.hrv is not None]
    gsr_values = [r.gsr for r in readings if r.gsr is not None]

    def safe_avg(vals):
        return round(sum(vals) / len(vals), 1) if vals else 0

    daily_eds = {}
    for r in readings:
        if r.eds is not None and r.timestamp:
            day = r.timestamp.strftime('%Y-%m-%d')
            if day not in daily_eds:
                daily_eds[day] = []
            daily_eds[day].append(r.eds)

    daily_avg = {day: round(sum(vals) / len(vals), 1) for day, vals in daily_eds.items()}

    return jsonify({
        'period_days': days,
        'total_readings': len(readings),
        'eds_avg': safe_avg(eds_values),
        'eds_min': round(min(eds_values), 1) if eds_values else 0,
        'eds_max': round(max(eds_values), 1) if eds_values else 0,
        'hr_avg': safe_avg(hr_values),
        'hrv_avg': safe_avg(hrv_values),
        'gsr_avg': safe_avg(gsr_values),
        'daily_eds': daily_avg,
    })
