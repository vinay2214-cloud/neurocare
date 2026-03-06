import json
import os

PROTOCOL_LIBRARY = [
    {
        'id': 'INT-001',
        'type': 'breathing',
        'name': 'Breathing Ring',
        'min_eds': 31,
        'max_eds': 100,
        'protocols': ['cbt', 'sensory', 'dbt'],
        'priority': 1,
        'phases': [
            {'name': 'Inhale', 'duration': 4},
            {'name': 'Hold', 'duration': 7},
            {'name': 'Exhale', 'duration': 8},
        ],
        'cycles': 3,
        'requires_verbal': False,
        'school_safe': True,
    },
    {
        'id': 'INT-002',
        'type': 'grounding',
        'name': '5-4-3-2-1 Grounding',
        'min_eds': 31,
        'max_eds': 80,
        'protocols': ['cbt', 'sensory'],
        'priority': 2,
        'steps': [
            {'count': 5, 'sense': 'see', 'emoji': '\U0001f440'},
            {'count': 4, 'sense': 'touch', 'emoji': '\U0001f932'},
            {'count': 3, 'sense': 'hear', 'emoji': '\U0001f442'},
            {'count': 2, 'sense': 'smell', 'emoji': '\U0001f443'},
            {'count': 1, 'sense': 'taste', 'emoji': '\U0001f445'},
        ],
        'requires_verbal': False,
        'school_safe': True,
    },
    {
        'id': 'INT-003',
        'type': 'emoji_mood',
        'name': 'Emoji Mood Grid',
        'min_eds': 0,
        'max_eds': 100,
        'protocols': ['cbt', 'sensory', 'dbt'],
        'priority': 3,
        'requires_verbal': False,
        'school_safe': True,
    },
    {
        'id': 'INT-004',
        'type': 'thought_reframe',
        'name': 'Thought Reframing',
        'min_eds': 0,
        'max_eds': 55,
        'protocols': ['cbt'],
        'priority': 4,
        'steps': [
            'What am I thinking right now?',
            'Is this thought a fact or a feeling?',
            'What would I tell a friend who thought this?',
            'What is a more balanced way to see this?',
        ],
        'requires_verbal': True,
        'school_safe': False,
    },
    {
        'id': 'INT-005',
        'type': 'body_scan',
        'name': 'Body Scan',
        'min_eds': 31,
        'max_eds': 75,
        'protocols': ['dbt'],
        'priority': 5,
        'areas': ['head', 'shoulders', 'chest', 'hands', 'feet'],
        'requires_verbal': False,
        'school_safe': True,
    },
    {
        'id': 'INT-006',
        'type': 'sensory_calm',
        'name': 'Sensory Calming',
        'min_eds': 56,
        'max_eds': 100,
        'protocols': ['sensory'],
        'priority': 6,
        'requires_verbal': False,
        'school_safe': True,
    },
]

_sustained_counters = {}
_recent_interventions = {}


def select_intervention(patient_id, eds, context=None, protocol='cbt', recent_minutes=30):
    from datetime import datetime, timezone, timedelta
    from models.intervention import Intervention

    cutoff = datetime.now(timezone.utc) - timedelta(minutes=recent_minutes)
    recent = Intervention.query.filter(
        Intervention.patient_id == patient_id,
        Intervention.timestamp >= cutoff
    ).all()
    recent_types = {i.intervention_type for i in recent}

    location = (context or {}).get('location', 'home')
    is_school = location == 'school'

    candidates = []
    for item in PROTOCOL_LIBRARY:
        if not (item['min_eds'] <= eds <= item['max_eds']):
            continue
        if protocol not in item['protocols']:
            continue
        if item['type'] in recent_types:
            continue
        if is_school and not item.get('school_safe', True):
            continue
        candidates.append(item)

    if not candidates:
        for item in PROTOCOL_LIBRARY:
            if item['min_eds'] <= eds <= item['max_eds']:
                candidates.append(item)
                break

    if not candidates:
        return PROTOCOL_LIBRARY[0]

    candidates.sort(key=lambda x: x['priority'])
    return candidates[0]


def check_sustained_trigger(patient_id, eds, threshold):
    key = str(patient_id)
    if key not in _sustained_counters:
        _sustained_counters[key] = 0

    if eds >= threshold:
        _sustained_counters[key] += 1
    else:
        _sustained_counters[key] = max(0, _sustained_counters[key] - 1)

    triggered = _sustained_counters[key] >= 6
    if triggered:
        _sustained_counters[key] = 0
    return triggered
