import os
import sys
import random
from datetime import datetime, timezone, timedelta, date

os.environ.setdefault('FLASK_ENV', 'development')

from app import create_app
from models import db
from models.user import User
from models.emotion_log import EmotionLog
from models.sensor_data import SensorData
from models.behavioral_event import BehavioralEvent
from models.intervention import Intervention
from models.atec_record import ATECRecord
from models.caregiver_log import CaregiverDailyLog
from models.therapist_note import TherapistNote
from models.sensory_profile import SensoryProfile

EMOJI_MAP = {
    1: 'Calm', 2: 'Happy', 3: 'Very Happy', 4: 'Loved',
    5: 'Unsure', 6: 'Numb', 7: 'Sad', 8: 'Very Sad',
    9: 'Worried', 10: 'Anxious', 11: 'Frustrated', 12: 'Angry',
    13: 'Overwhelmed', 14: 'Uncomfortable', 15: 'Tired', 16: 'Need a Hug',
}

EVENT_TYPES = ['meltdown', 'aggression', 'stimming', 'task_completion',
               'routine_break', 'social_withdrawal', 'transition_difficulty',
               'eye_contact', 'communication']

INTERVENTION_TYPES = ['breathing', 'grounding', 'emoji_mood', 'thought_reframe',
                      'body_scan', 'sensory_calm']

OUTCOMES = ['accepted', 'dismissed', 'overridden', 'completed']


def eds_state(eds):
    if eds <= 30:
        return 'calm'
    elif eds <= 55:
        return 'moderate'
    elif eds <= 75:
        return 'elevated'
    return 'critical'


def generate_sensor_reading(hour, patient_profile, day_of_week):
    base_stress = patient_profile.get('base_stress', 0)
    school_hours = 9 <= hour <= 15 and day_of_week < 5
    peak_hours = patient_profile.get('peak_hours', [])
    is_peak = hour in peak_hours

    stress_factor = base_stress
    if school_hours and patient_profile.get('school_stress', False):
        stress_factor += 0.3
    if is_peak:
        stress_factor += 0.25
    stress_factor += random.uniform(-0.1, 0.1)
    stress_factor = max(0, min(1, stress_factor))

    hr = 72 + stress_factor * 60 + random.uniform(-3, 3)
    hrv = 65 - stress_factor * 45 + random.uniform(-5, 5)
    gsr = 1.0 + stress_factor * 18 + random.uniform(-0.5, 0.5)
    body_temp = 36.5 + stress_factor * 1.0 + random.uniform(-0.1, 0.1)
    motion = 0.1 + stress_factor * 2.5 + random.uniform(-0.1, 0.1)
    breathing_rate = 14 + stress_factor * 14 + random.uniform(-1, 1)
    muscle_tension = 10 + stress_factor * 70 + random.uniform(-5, 5)
    facial_tension = 10 + stress_factor * 65 + random.uniform(-5, 5)
    eye_blink_rate = 14 + stress_factor * 20 + random.uniform(-2, 2)
    sleep_quality = 80 - stress_factor * 40 + random.uniform(-5, 5)

    hrv = max(10, hrv)
    eds_val = stress_factor * 85 + random.uniform(-5, 5)
    eds_val = max(0, min(100, eds_val))

    return {
        'hr': round(hr, 1), 'hrv': round(max(10, hrv), 1),
        'gsr': round(max(0.5, gsr), 2), 'body_temp': round(body_temp, 2),
        'motion': round(max(0, motion), 2), 'breathing_rate': round(max(10, breathing_rate), 1),
        'muscle_tension': round(max(0, min(100, muscle_tension)), 1),
        'sleep_quality': round(max(10, min(100, sleep_quality)), 1),
        'facial_tension': round(max(0, min(100, facial_tension)), 1),
        'eye_blink_rate': round(max(8, eye_blink_rate), 1),
        'eds': round(eds_val, 1),
        'eds_state': eds_state(eds_val),
    }


PATIENT_PROFILES = {
    'PAT_001': {
        'name': 'Arjun',
        'base_stress': 0.25,
        'school_stress': True,
        'peak_hours': [9, 10, 14, 15],
        'preferred_emojis': [1, 2, 9, 10, 11, 15],
        'common_events': ['meltdown', 'stimming', 'transition_difficulty', 'task_completion'],
        'preferred_intervention': 'breathing',
        'protocol': 'cbt',
        'sensory': {'noise': 4, 'light': 3, 'touch': 2, 'crowd': 3},
    },
    'PAT_002': {
        'name': 'Meera',
        'base_stress': 0.20,
        'school_stress': False,
        'peak_hours': [12, 13, 17, 18],
        'preferred_emojis': [1, 5, 7, 9, 10, 16],
        'common_events': ['social_withdrawal', 'stimming', 'eye_contact', 'communication'],
        'preferred_intervention': 'grounding',
        'protocol': 'sensory',
        'sensory': {'noise': 5, 'light': 4, 'touch': 4, 'crowd': 5},
    },
    'PAT_003': {
        'name': 'Ravi',
        'base_stress': 0.30,
        'school_stress': True,
        'peak_hours': [8, 9, 11, 16],
        'preferred_emojis': [6, 11, 12, 13, 14, 15],
        'common_events': ['meltdown', 'aggression', 'stimming', 'routine_break'],
        'preferred_intervention': 'emoji_mood',
        'protocol': 'dbt',
        'sensory': {'noise': 3, 'light': 2, 'touch': 5, 'crowd': 4},
    },
}


def seed_database():
    app = create_app()
    with app.app_context():
        print("Dropping all tables...")
        db.drop_all()
        print("Creating all tables...")
        db.create_all()

        print("Creating users...")
        therapist = User(
            code='THR_001', role='therapist', name='Dr. Priya Sharma',
            email='dr.priya@neurocare.demo', assigned_patients=[]
        )
        therapist.set_password('demo123')
        db.session.add(therapist)

        caregiver = User(
            code='CAR_001', role='caregiver', name='Arjun\'s Parent',
            email='parent.arjun@neurocare.demo', assigned_patients=[]
        )
        caregiver.set_password('demo123')
        db.session.add(caregiver)

        patients = {}
        for code, profile in PATIENT_PROFILES.items():
            p = User(
                code=code, role='patient', name=profile['name'],
                email=f'patient.{profile["name"].lower()}@neurocare.demo',
                assigned_patients=[]
            )
            p.set_password('demo123')
            db.session.add(p)
            patients[code] = p

        db.session.flush()

        patient_ids = [patients[c].id for c in ['PAT_001', 'PAT_002', 'PAT_003']]
        therapist.assigned_patients = patient_ids
        caregiver.assigned_patients = [patients['PAT_001'].id]
        db.session.commit()

        print("Creating sensory profiles...")
        for code, profile in PATIENT_PROFILES.items():
            sp = SensoryProfile(
                patient_id=patients[code].id,
                noise_sensitivity=profile['sensory']['noise'],
                light_sensitivity=profile['sensory']['light'],
                touch_sensitivity=profile['sensory']['touch'],
                crowd_sensitivity=profile['sensory']['crowd'],
                texture_sensitivity=random.randint(2, 4),
                movement_sensitivity=random.randint(2, 4),
                temperature_sensitivity=random.randint(2, 4),
                preferred_inputs=['deep pressure', 'weighted blanket', 'fidget toy', 'quiet space'],
                protocol=profile['protocol'],
                intervention_threshold=55 if code == 'PAT_001' else (50 if code == 'PAT_002' else 60),
                resting_hr=random.uniform(72, 78),
                resting_hrv=random.uniform(55, 65),
                resting_gsr=random.uniform(1.0, 2.0),
                resting_temp=random.uniform(36.4, 36.7),
            )
            db.session.add(sp)
        db.session.commit()

        now = datetime.now(timezone.utc)
        today = now.date()

        for code, profile in PATIENT_PROFILES.items():
            patient = patients[code]
            pid = patient.id
            print(f"Seeding data for {code} ({profile['name']})...")

            print(f"  Sensor data (30 days, 1/min for 8 waking hours)...")
            sensor_batch = []
            for day_offset in range(30):
                d = today - timedelta(days=29 - day_offset)
                dow = d.weekday()
                for hour in range(7, 22):
                    for minute in [0, 15, 30, 45]:
                        ts = datetime(d.year, d.month, d.day, hour, minute, 0, tzinfo=timezone.utc)
                        reading = generate_sensor_reading(hour, profile, dow)
                        sensor_batch.append(SensorData(
                            patient_id=pid, timestamp=ts,
                            hr=reading['hr'], hrv=reading['hrv'], gsr=reading['gsr'],
                            body_temp=reading['body_temp'], motion=reading['motion'],
                            breathing_rate=reading['breathing_rate'],
                            muscle_tension=reading['muscle_tension'],
                            sleep_quality=reading['sleep_quality'],
                            facial_tension=reading['facial_tension'],
                            eye_blink_rate=reading['eye_blink_rate'],
                            eds=reading['eds'], eds_state=reading['eds_state'],
                            sensor_mode='mock',
                        ))
            db.session.bulk_save_objects(sensor_batch)
            db.session.commit()
            print(f"    Added {len(sensor_batch)} sensor readings")

            print(f"  Emotion logs...")
            emotion_batch = []
            for day_offset in range(30):
                d = today - timedelta(days=29 - day_offset)
                num_emotions = random.randint(3, 5)
                for _ in range(num_emotions):
                    eid = random.choice(profile['preferred_emojis'])
                    hour = random.randint(8, 20)
                    ts = datetime(d.year, d.month, d.day, hour, random.randint(0, 59), 0, tzinfo=timezone.utc)
                    emotion_batch.append(EmotionLog(
                        patient_id=pid, timestamp=ts,
                        emoji_id=eid, emoji_name=EMOJI_MAP[eid],
                        intensity=random.randint(1, 5),
                        source='patient_self',
                        context_location=random.choice(['home', 'school', 'outside']),
                        context_activity=random.choice(['learning', 'playing', 'eating', 'social']),
                    ))
            db.session.bulk_save_objects(emotion_batch)
            db.session.commit()
            print(f"    Added {len(emotion_batch)} emotion logs")

            print(f"  Behavioral events...")
            event_batch = []
            for day_offset in range(30):
                d = today - timedelta(days=29 - day_offset)
                num_events = random.randint(1, 3)
                for _ in range(num_events):
                    et = random.choice(profile['common_events'])
                    hour = random.randint(8, 19)
                    ts = datetime(d.year, d.month, d.day, hour, random.randint(0, 59), 0, tzinfo=timezone.utc)
                    event_batch.append(BehavioralEvent(
                        patient_id=pid, logged_by=caregiver.id, timestamp=ts,
                        event_type=et, severity=random.randint(1, 4),
                        duration_seconds=random.randint(30, 600),
                        location=random.choice(['home', 'school', 'public']),
                        activity=random.choice(['learning', 'playing', 'eating', 'routine', 'social']),
                        noise_level=random.randint(1, 5),
                        notes=f'Auto-seeded event: {et}',
                    ))
            db.session.bulk_save_objects(event_batch)
            db.session.commit()
            print(f"    Added {len(event_batch)} behavioral events")

            print(f"  Interventions...")
            int_batch = []
            for day_offset in range(30):
                d = today - timedelta(days=29 - day_offset)
                num_ints = random.randint(0, 3)
                for _ in range(num_ints):
                    hour = random.randint(8, 19)
                    ts = datetime(d.year, d.month, d.day, hour, random.randint(0, 59), 0, tzinfo=timezone.utc)
                    eds_trigger = random.uniform(40, 85)
                    itype = random.choice(INTERVENTION_TYPES[:3]) if random.random() < 0.5 else random.choice(INTERVENTION_TYPES)
                    if code == 'PAT_001':
                        itype = 'breathing' if random.random() < 0.6 else itype
                    elif code == 'PAT_002':
                        itype = 'grounding' if random.random() < 0.6 else itype
                    elif code == 'PAT_003':
                        itype = 'emoji_mood' if random.random() < 0.6 else itype

                    outcome = random.choices(
                        OUTCOMES, weights=[40, 15, 10, 35], k=1
                    )[0]

                    int_batch.append(Intervention(
                        patient_id=pid, timestamp=ts,
                        trigger_eds=round(eds_trigger, 1),
                        trigger_state=eds_state(eds_trigger),
                        intervention_type=itype,
                        duration_seconds=random.randint(30, 300),
                        outcome=outcome,
                        eds_before=round(eds_trigger, 1),
                        eds_after=round(max(10, eds_trigger - random.uniform(5, 30)), 1),
                    ))
            db.session.bulk_save_objects(int_batch)
            db.session.commit()
            print(f"    Added {len(int_batch)} interventions")

            print(f"  ATEC records...")
            for atec_offset in [60, 30]:
                d = today - timedelta(days=atec_offset)
                improvement = 0 if atec_offset == 60 else random.randint(3, 10)
                s1 = max(0, random.randint(8, 18) - improvement)
                s2 = max(0, random.randint(12, 28) - improvement)
                s3 = max(0, random.randint(10, 22) - improvement)
                s4 = max(0, random.randint(20, 45) - improvement)
                atec = ATECRecord(
                    patient_id=pid, date=d, completed_by=caregiver.id,
                    subscale_1=s1, subscale_2=s2, subscale_3=s3, subscale_4=s4,
                    total=s1 + s2 + s3 + s4,
                )
                db.session.add(atec)
            db.session.commit()

            print(f"  Caregiver daily logs...")
            log_batch = []
            for day_offset in range(28):
                d = today - timedelta(days=27 - day_offset)
                log_batch.append(CaregiverDailyLog(
                    patient_id=pid, caregiver_id=caregiver.id, date=d,
                    sleep_hours=round(random.uniform(6, 10), 1),
                    sleep_quality=random.randint(2, 5),
                    meals_regular=random.random() > 0.2,
                    medication_taken=random.random() > 0.3,
                    mood_morning=random.randint(2, 5),
                    mood_afternoon=random.randint(2, 5),
                    mood_evening=random.randint(2, 5),
                    meltdown_count=random.randint(0, 3),
                    stimming_level=random.randint(1, 5),
                    social_engagement=random.randint(1, 5),
                    physical_activity_minutes=random.randint(0, 90),
                    daily_summary=f'Day summary for {d.isoformat()}: overall {"good" if random.random() > 0.4 else "challenging"} day.',
                ))
            db.session.bulk_save_objects(log_batch)
            db.session.commit()
            print(f"    Added {len(log_batch)} daily logs")

            print(f"  Therapist notes...")
            for note_idx in range(4):
                d = today - timedelta(days=note_idx * 7 + random.randint(0, 3))
                note_types = ['session', 'observation', 'atec', 'goal']
                note_texts = [
                    f'Session with {profile["name"]}: Reviewed weekly EDS trends. Patient shows improvement in emotional regulation during morning transitions. Recommend continuing current intervention protocol.',
                    f'Observation: {profile["name"]} displayed increased engagement during group activities today. Social interaction quality improving. Continue monitoring eye contact frequency.',
                    f'ATEC review for {profile["name"]}: Subscale scores trending downward (positive). Speech/Language showing most improvement. Plan to reassess in 4 weeks.',
                    f'Updated therapy goals for {profile["name"]}: Focus on transition coping strategies and sensory regulation. Increase grounding exercise frequency.'
                ]
                note = TherapistNote(
                    therapist_id=therapist.id, patient_id=pid,
                    timestamp=datetime(d.year, d.month, d.day, 14, 30, 0, tzinfo=timezone.utc),
                    note_text=note_texts[note_idx],
                    note_type=note_types[note_idx],
                )
                db.session.add(note)
            db.session.commit()

        print("\nSeed complete!")
        print("=" * 50)
        print("Demo Accounts:")
        print(f"  Therapist: dr.priya@neurocare.demo / demo123")
        print(f"  Caregiver: parent.arjun@neurocare.demo / demo123")
        print(f"  Patient:   PAT_001 / demo123")
        print(f"  Patient:   PAT_002 / demo123")
        print(f"  Patient:   PAT_003 / demo123")
        print("=" * 50)


if __name__ == '__main__':
    seed_database()
