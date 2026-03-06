from models import db
from datetime import datetime, timezone


class SensorData(db.Model):
    __tablename__ = 'sensor_data'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    hr = db.Column(db.Float)
    hrv = db.Column(db.Float)
    gsr = db.Column(db.Float)
    body_temp = db.Column(db.Float)
    motion = db.Column(db.Float)
    breathing_rate = db.Column(db.Float)
    muscle_tension = db.Column(db.Float)
    sleep_quality = db.Column(db.Float)
    facial_tension = db.Column(db.Float)
    eye_blink_rate = db.Column(db.Float)
    eds = db.Column(db.Float)
    eds_state = db.Column(db.String(20))
    sensor_mode = db.Column(db.String(10), default='mock')

    patient = db.relationship('User', backref=db.backref('sensor_data', lazy='dynamic'))

    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'hr': self.hr,
            'hrv': self.hrv,
            'gsr': self.gsr,
            'body_temp': self.body_temp,
            'motion': self.motion,
            'breathing_rate': self.breathing_rate,
            'muscle_tension': self.muscle_tension,
            'sleep_quality': self.sleep_quality,
            'facial_tension': self.facial_tension,
            'eye_blink_rate': self.eye_blink_rate,
            'eds': self.eds,
            'eds_state': self.eds_state,
            'sensor_mode': self.sensor_mode,
        }
