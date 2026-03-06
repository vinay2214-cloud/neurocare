from flask import Blueprint, request, jsonify
from models import db
from models.intervention import Intervention
from models.sensory_profile import SensoryProfile
from services.intervention_engine import select_intervention, check_sustained_trigger
from routes.auth import token_required
from datetime import datetime, timezone, timedelta
from sqlalchemy import func

interventions_bp = Blueprint('interventions', __name__)


@interventions_bp.route('/trigger', methods=['POST'])
@token_required
def trigger_intervention(current_user):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    patient_id = data.get('patient_id', current_user.id)
    eds = data.get('eds', 50)
    context = data.get('context', {})

    profile = SensoryProfile.query.filter_by(patient_id=patient_id).first()
    protocol = profile.protocol if profile else 'cbt'
    threshold = profile.intervention_threshold if profile else 55

    should_trigger = data.get('force', False) or check_sustained_trigger(patient_id, eds, threshold)

    if not should_trigger:
        return jsonify({'triggered': False, 'message': 'EDS below sustained threshold'})

    intervention = select_intervention(patient_id, eds, context, protocol)

    record = Intervention(
        patient_id=patient_id,
        trigger_eds=eds,
        trigger_state=data.get('eds_state', 'moderate'),
        intervention_type=intervention['type'],
        eds_before=eds,
    )
    db.session.add(record)
    db.session.commit()

    return jsonify({
        'triggered': True,
        'intervention_id': record.id,
        'intervention': intervention,
    })


@interventions_bp.route('/outcome', methods=['POST'])
@token_required
def log_outcome(current_user):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    intervention_id = data.get('intervention_id')
    if not intervention_id:
        return jsonify({'error': 'intervention_id required'}), 400

    record = Intervention.query.get(intervention_id)
    if not record:
        return jsonify({'error': 'Intervention not found'}), 404

    record.outcome = data.get('outcome', 'completed')
    record.duration_seconds = data.get('duration_seconds')
    record.eds_after = data.get('eds_after')
    record.notes = data.get('notes')
    db.session.commit()

    return jsonify(record.to_dict())


@interventions_bp.route('/<int:patient_id>/history', methods=['GET'])
@token_required
def intervention_history(current_user, patient_id):
    days = request.args.get('days', 30, type=int)
    since = datetime.now(timezone.utc) - timedelta(days=days)

    records = Intervention.query.filter(
        Intervention.patient_id == patient_id,
        Intervention.timestamp >= since
    ).order_by(Intervention.timestamp.desc()).all()

    return jsonify({'interventions': [r.to_dict() for r in records]})


@interventions_bp.route('/<int:patient_id>/analytics', methods=['GET'])
@token_required
def intervention_analytics(current_user, patient_id):
    days = request.args.get('days', 30, type=int)
    since = datetime.now(timezone.utc) - timedelta(days=days)

    records = Intervention.query.filter(
        Intervention.patient_id == patient_id,
        Intervention.timestamp >= since
    ).all()

    by_type = {}
    for r in records:
        t = r.intervention_type
        if t not in by_type:
            by_type[t] = {'total': 0, 'accepted': 0, 'dismissed': 0, 'overridden': 0, 'completed': 0}
        by_type[t]['total'] += 1
        if r.outcome:
            outcome_key = r.outcome if r.outcome in by_type[t] else 'accepted'
            by_type[t][outcome_key] = by_type[t].get(outcome_key, 0) + 1

    total = len(records)
    accepted = sum(1 for r in records if r.outcome in ('accepted', 'completed'))

    return jsonify({
        'total': total,
        'acceptance_rate': round((accepted / total * 100), 1) if total > 0 else 0,
        'by_type': by_type,
    })
