from models import db
from models.sensor_data import SensorData
from models.emotion_log import EmotionLog
from models.behavioral_event import BehavioralEvent
from models.atec_record import ATECRecord
from models.sensory_profile import SensoryProfile
from datetime import datetime, timezone, timedelta

_last_eds = {}


def get_patient_baseline(patient_id):
    profile = SensoryProfile.query.filter_by(patient_id=patient_id).first()
    if profile:
        return profile
    return type('Baseline', (), {
        'resting_hr': 75.0, 'resting_hrv': 60.0,
        'resting_gsr': 1.5, 'resting_temp': 36.6,
    })()


def normalize_hr(hr, resting_hr):
    deviation = abs(hr - resting_hr)
    return min(100, (deviation / 60.0) * 100)


def normalize_hrv_inverse(hrv, resting_hrv):
    if resting_hrv <= 0:
        resting_hrv = 60.0
    ratio = hrv / resting_hrv
    score = (1.0 - min(ratio, 1.0)) * 100
    return max(0, min(100, score))


def normalize_gsr(gsr, resting_gsr):
    deviation = max(0, gsr - resting_gsr)
    return min(100, (deviation / 20.0) * 100)


def normalize_temp(temp, resting_temp):
    deviation = abs(temp - resting_temp)
    return min(100, (deviation / 2.0) * 100)


def compute_negative_emotion_frequency(recent_emotions, minutes=60):
    negative_ids = {5, 6, 7, 8, 9, 10, 11, 12, 13}
    if not recent_emotions:
        return 20
    total = len(recent_emotions)
    negative_count = sum(1 for e in recent_emotions if e.emoji_id in negative_ids)
    if total == 0:
        return 20
    return min(100, (negative_count / max(total, 1)) * 100)


def get_last_eds(patient_id):
    return _last_eds.get(patient_id)


def eds_state_from_score(eds):
    if eds <= 30:
        return 'calm'
    elif eds <= 55:
        return 'moderate'
    elif eds <= 75:
        return 'elevated'
    else:
        return 'critical'


class EDSCalculator:
    @staticmethod
    def compute(patient_id, sensor_reading, recent_emotions=None, behavioral_events=None, context=None):
        baseline = get_patient_baseline(patient_id)

        hr = sensor_reading.get('hr', 75)
        hrv = sensor_reading.get('hrv', 60)
        gsr = sensor_reading.get('gsr', 1.5)
        body_temp = sensor_reading.get('body_temp', 36.6)
        motion = sensor_reading.get('motion', 0.2)

        hr_norm = normalize_hr(hr, baseline.resting_hr)
        hrv_norm = normalize_hrv_inverse(hrv, baseline.resting_hrv)
        gsr_norm = normalize_gsr(gsr, baseline.resting_gsr)
        temp_norm = normalize_temp(body_temp, baseline.resting_temp)
        motion_norm = min(100, (motion / 3.0) * 100)

        physio = (hr_norm * 0.30 + hrv_norm * 0.20 + gsr_norm * 0.25 +
                  temp_norm * 0.10 + motion_norm * 0.15)

        if recent_emotions is None:
            recent_emotions = EmotionLog.query.filter(
                EmotionLog.patient_id == patient_id,
                EmotionLog.timestamp >= datetime.now(timezone.utc) - timedelta(hours=1)
            ).all()

        if recent_emotions:
            last_emotion = recent_emotions[-1]
            intensity_score = (last_emotion.intensity / 5.0) * 100
        else:
            intensity_score = 30
        freq_score = compute_negative_emotion_frequency(recent_emotions)
        emotion_score = intensity_score * 0.6 + freq_score * 0.4

        if behavioral_events is None:
            behavioral_events = BehavioralEvent.query.filter(
                BehavioralEvent.patient_id == patient_id,
                BehavioralEvent.timestamp >= datetime.now(timezone.utc) - timedelta(hours=2)
            ).all()

        behavior_score = 0
        for event in behavioral_events:
            if event.event_type == 'meltdown':
                behavior_score += 40
            elif event.event_type == 'aggression':
                behavior_score += 30
            elif event.event_type == 'stimming':
                behavior_score += 15
            elif event.event_type in ('routine_break', 'transition_difficulty'):
                behavior_score += 10
            elif event.event_type == 'social_withdrawal':
                behavior_score += 10
        behavior_score = min(100, behavior_score)

        context_score = 0
        if context:
            location = context.get('location', '')
            noise = context.get('noise_level', 0)
            crowd = context.get('crowd_sensitivity_triggered', False)
            if location == 'public':
                context_score += 15
            if location == 'school':
                context_score += 10
            if isinstance(noise, (int, float)) and noise >= 4:
                context_score += 15
            if crowd:
                context_score += 10
        context_score = min(40, context_score)

        latest_atec = ATECRecord.query.filter_by(patient_id=patient_id).order_by(
            ATECRecord.date.desc()).first()
        if latest_atec and latest_atec.subscale_4 is not None:
            atec_score = (latest_atec.subscale_4 / 75.0) * 100
        else:
            atec_score = 30

        raw_eds = (physio * 0.35 + emotion_score * 0.25 + behavior_score * 0.20 +
                   context_score * 0.10 + atec_score * 0.10)

        prev = get_last_eds(patient_id)
        if prev is not None:
            smoothed = 0.35 * raw_eds + 0.65 * prev
        else:
            smoothed = raw_eds

        smoothed = max(0, min(100, round(smoothed, 1)))
        _last_eds[patient_id] = smoothed

        return {
            'eds': smoothed,
            'eds_state': eds_state_from_score(smoothed),
            'components': {
                'physio': round(physio, 1),
                'emotion': round(emotion_score, 1),
                'behavior': round(behavior_score, 1),
                'context': round(context_score, 1),
                'atec': round(atec_score, 1),
            },
            'raw_eds': round(raw_eds, 1),
        }
