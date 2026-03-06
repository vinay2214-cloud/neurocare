from flask import Blueprint, request, jsonify
from models import db
from models.atec_record import ATECRecord
from routes.auth import token_required
from datetime import datetime, timezone

atec_bp = Blueprint('atec', __name__)


@atec_bp.route('/submit', methods=['POST'])
@token_required
def submit_atec(current_user):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    patient_id = data.get('patient_id')
    if not patient_id:
        return jsonify({'error': 'patient_id required'}), 400

    s1 = max(0, min(28, data.get('subscale_1', 0)))
    s2 = max(0, min(40, data.get('subscale_2', 0)))
    s3 = max(0, min(36, data.get('subscale_3', 0)))
    s4 = max(0, min(75, data.get('subscale_4', 0)))
    total = s1 + s2 + s3 + s4

    record = ATECRecord(
        patient_id=patient_id,
        date=datetime.now(timezone.utc).date(),
        completed_by=current_user.id,
        subscale_1=s1,
        subscale_2=s2,
        subscale_3=s3,
        subscale_4=s4,
        total=total,
        physical_activity=data.get('physical_activity'),
        adult_time=data.get('adult_time'),
        speech_therapy=data.get('speech_therapy'),
        electronic_device_time=data.get('electronic_device_time'),
        educational_app_supervised=data.get('educational_app_supervised'),
        educational_app_independent=data.get('educational_app_independent'),
        video_time=data.get('video_time'),
    )
    db.session.add(record)
    db.session.commit()
    return jsonify(record.to_dict()), 201


@atec_bp.route('/<int:patient_id>/history', methods=['GET'])
@token_required
def atec_history(current_user, patient_id):
    records = ATECRecord.query.filter_by(patient_id=patient_id).order_by(
        ATECRecord.date.asc()).all()
    return jsonify({'records': [r.to_dict() for r in records]})


@atec_bp.route('/<int:patient_id>/latest', methods=['GET'])
@token_required
def atec_latest(current_user, patient_id):
    record = ATECRecord.query.filter_by(patient_id=patient_id).order_by(
        ATECRecord.date.desc()).first()
    if not record:
        return jsonify({'error': 'No ATEC records'}), 404
    return jsonify(record.to_dict())
