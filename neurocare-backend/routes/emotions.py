from flask import Blueprint, request, jsonify
from models import db
from models.emotion_log import EmotionLog
from routes.auth import token_required
from datetime import datetime, timezone, timedelta
from sqlalchemy import func

emotions_bp = Blueprint('emotions', __name__)

EMOJI_MAP = {
    1: 'Calm', 2: 'Happy', 3: 'Very Happy', 4: 'Loved',
    5: 'Unsure', 6: 'Numb', 7: 'Sad', 8: 'Very Sad',
    9: 'Worried', 10: 'Anxious', 11: 'Frustrated', 12: 'Angry',
    13: 'Overwhelmed', 14: 'Uncomfortable', 15: 'Tired', 16: 'Need a Hug',
}


@emotions_bp.route('', methods=['POST'])
@token_required
def log_emotion(current_user):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    emoji_id = data.get('emoji_id')
    if emoji_id not in EMOJI_MAP:
        return jsonify({'error': 'Invalid emoji_id'}), 400

    patient_id = data.get('patient_id', current_user.id)
    log = EmotionLog(
        patient_id=patient_id,
        emoji_id=emoji_id,
        emoji_name=EMOJI_MAP[emoji_id],
        intensity=max(1, min(5, data.get('intensity', 3))),
        source=data.get('source', 'patient_self'),
        context_location=data.get('context_location'),
        context_activity=data.get('context_activity'),
        social_environment=data.get('social_environment'),
        notes=data.get('notes'),
    )
    db.session.add(log)
    db.session.commit()
    return jsonify(log.to_dict()), 201


@emotions_bp.route('/<int:patient_id>', methods=['GET'])
@token_required
def get_emotions(current_user, patient_id):
    days = request.args.get('days', 7, type=int)
    limit = request.args.get('limit', 100, type=int)
    since = datetime.now(timezone.utc) - timedelta(days=days)

    logs = EmotionLog.query.filter(
        EmotionLog.patient_id == patient_id,
        EmotionLog.timestamp >= since
    ).order_by(EmotionLog.timestamp.desc()).limit(limit).all()

    return jsonify({'emotions': [l.to_dict() for l in logs]})


@emotions_bp.route('/<int:patient_id>/frequency', methods=['GET'])
@token_required
def emotion_frequency(current_user, patient_id):
    days = request.args.get('days', 30, type=int)
    since = datetime.now(timezone.utc) - timedelta(days=days)

    results = db.session.query(
        EmotionLog.emoji_id,
        EmotionLog.emoji_name,
        func.count(EmotionLog.id).label('count')
    ).filter(
        EmotionLog.patient_id == patient_id,
        EmotionLog.timestamp >= since
    ).group_by(EmotionLog.emoji_id, EmotionLog.emoji_name).all()

    frequency = [{'emoji_id': r.emoji_id, 'emoji_name': r.emoji_name, 'count': r.count}
                 for r in results]
    frequency.sort(key=lambda x: -x['count'])
    return jsonify({'frequency': frequency})
