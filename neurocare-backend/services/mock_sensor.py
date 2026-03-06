import random
import math
import time
from datetime import datetime, timezone

SCENARIOS = ['baseline', 'escalation', 'meltdown', 'recovery']

SCENARIO_DURATION = {
    'baseline': 180,
    'escalation': 300,
    'meltdown': 30,
    'recovery': 180,
}

SCENARIO_ORDER = ['baseline', 'escalation', 'meltdown', 'recovery']

# Per-patient baseline profiles so each patient shows distinct readings
PATIENT_BASELINES = {
    1: {'hr': (78, 84), 'hrv': (50, 62), 'gsr': (2.5, 3.8), 'temp': (36.5, 36.9), 'motion': (0.15, 0.35)},
    2: {'hr': (88, 96), 'hrv': (38, 50), 'gsr': (5.0, 7.0), 'temp': (36.7, 37.1), 'motion': (0.3, 0.6)},
    3: {'hr': (65, 72), 'hrv': (62, 78), 'gsr': (1.0, 2.0), 'temp': (36.3, 36.7), 'motion': (0.08, 0.22)},
}
DEFAULT_BASELINE = {'hr': (72, 78), 'hrv': (55, 70), 'gsr': (1.0, 2.0), 'temp': (36.4, 36.8), 'motion': (0.1, 0.3)}


class PatientScenario:
    def __init__(self):
        self._patients = {}

    def _get_state(self, patient_id):
        if patient_id not in self._patients:
            self._patients[patient_id] = {
                'scenario_index': 0,
                'scenario_start': time.time(),
                'tick': 0,
            }
        state = self._patients[patient_id]
        current = SCENARIO_ORDER[state['scenario_index']]
        elapsed = time.time() - state['scenario_start']
        if elapsed > SCENARIO_DURATION[current]:
            state['scenario_index'] = (state['scenario_index'] + 1) % len(SCENARIO_ORDER)
            state['scenario_start'] = time.time()
            state['tick'] = 0
        state['tick'] += 1
        return state

    def _current_scenario(self, patient_id):
        state = self._get_state(patient_id)
        return SCENARIO_ORDER[state['scenario_index']]

    def generate_reading(self, patient_id):
        scenario = self._current_scenario(patient_id)
        state = self._patients[patient_id]
        tick = state['tick']
        elapsed = time.time() - state['scenario_start']
        duration = SCENARIO_DURATION[scenario]
        progress = min(elapsed / duration, 1.0)

        b = PATIENT_BASELINES.get(patient_id, DEFAULT_BASELINE)

        if scenario == 'baseline':
            hr = random.uniform(*b['hr'])
            hrv = random.uniform(*b['hrv'])
            gsr = random.uniform(*b['gsr'])
            body_temp = random.uniform(*b['temp'])
            motion = random.uniform(*b['motion'])
            breathing_rate = random.uniform(14, 16)
            muscle_tension = random.uniform(5, 15)
            facial_tension = random.uniform(5, 15)
            eye_blink_rate = random.uniform(12, 18)

        elif scenario == 'escalation':
            hr = b['hr'][1] + progress * random.uniform(17, 37)
            hrv = b['hrv'][0] - progress * random.uniform(20, 35)
            gsr = b['gsr'][1] + progress * random.uniform(4, 10)
            body_temp = b['temp'][1] + progress * random.uniform(0.2, 0.6)
            motion = b['motion'][1] + progress * random.uniform(0.3, 1.0)
            breathing_rate = 16 + progress * random.uniform(6, 12)
            muscle_tension = 15 + progress * random.uniform(20, 45)
            facial_tension = 15 + progress * random.uniform(15, 40)
            eye_blink_rate = 18 + progress * random.uniform(5, 15)

        elif scenario == 'meltdown':
            hr = random.uniform(120, 140)
            hrv = random.uniform(15, 25)
            gsr = random.uniform(15, 25)
            body_temp = random.uniform(37.2, 37.8)
            motion = random.uniform(2.0, 3.5)
            breathing_rate = random.uniform(24, 32)
            muscle_tension = random.uniform(60, 90)
            facial_tension = random.uniform(55, 85)
            eye_blink_rate = random.uniform(25, 40)

        else:  # recovery
            decay = math.exp(-3.0 * progress)
            hr = b['hr'][0] + decay * random.uniform(35, 55)
            hrv = b['hrv'][1] - decay * random.uniform(25, 40)
            gsr = b['gsr'][0] + decay * random.uniform(10, 20)
            body_temp = b['temp'][0] + decay * random.uniform(0.4, 0.8)
            motion = b['motion'][0] + decay * random.uniform(1.5, 2.5)
            breathing_rate = 15 + decay * random.uniform(8, 14)
            muscle_tension = 10 + decay * random.uniform(40, 60)
            facial_tension = 10 + decay * random.uniform(35, 55)
            eye_blink_rate = 15 + decay * random.uniform(10, 20)

        hrv = max(10, hrv)
        sleep_quality = random.uniform(50, 85) if scenario == 'baseline' else random.uniform(30, 60)

        return {
            'patient_id': patient_id,
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'hr': round(hr, 1),
            'hrv': round(hrv, 1),
            'gsr': round(gsr, 2),
            'body_temp': round(body_temp, 2),
            'motion': round(motion, 2),
            'breathing_rate': round(breathing_rate, 1),
            'muscle_tension': round(muscle_tension, 1),
            'sleep_quality': round(sleep_quality, 1),
            'facial_tension': round(facial_tension, 1),
            'eye_blink_rate': round(eye_blink_rate, 1),
            'scenario': scenario,
            'sensor_mode': 'mock',
        }


patient_scenario = PatientScenario()
