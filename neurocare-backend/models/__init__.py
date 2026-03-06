from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from models.user import User
from models.emotion_log import EmotionLog
from models.sensor_data import SensorData
from models.behavioral_event import BehavioralEvent
from models.intervention import Intervention
from models.atec_record import ATECRecord
from models.caregiver_log import CaregiverDailyLog
from models.therapist_note import TherapistNote
from models.sensory_profile import SensoryProfile
from models.dashboard_config import DashboardConfig
