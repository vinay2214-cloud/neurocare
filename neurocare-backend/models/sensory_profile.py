from models import db
from datetime import datetime, timezone


class SensoryProfile(db.Model):
    __tablename__ = 'sensory_profiles'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)
    noise_sensitivity = db.Column(db.Integer, default=3)
    light_sensitivity = db.Column(db.Integer, default=3)
    touch_sensitivity = db.Column(db.Integer, default=3)
    texture_sensitivity = db.Column(db.Integer, default=3)
    crowd_sensitivity = db.Column(db.Integer, default=3)
    movement_sensitivity = db.Column(db.Integer, default=3)
    temperature_sensitivity = db.Column(db.Integer, default=3)
    preferred_inputs = db.Column(db.JSON, default=list)
    protocol = db.Column(db.String(20), default='cbt')
    intervention_threshold = db.Column(db.Integer, default=55)
    resting_hr = db.Column(db.Float, default=75.0)
    resting_hrv = db.Column(db.Float, default=60.0)
    resting_gsr = db.Column(db.Float, default=1.5)
    resting_temp = db.Column(db.Float, default=36.6)

    patient = db.relationship('User', backref=db.backref('sensory_profile', uselist=False))

    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'noise_sensitivity': self.noise_sensitivity,
            'light_sensitivity': self.light_sensitivity,
            'touch_sensitivity': self.touch_sensitivity,
            'texture_sensitivity': self.texture_sensitivity,
            'crowd_sensitivity': self.crowd_sensitivity,
            'movement_sensitivity': self.movement_sensitivity,
            'temperature_sensitivity': self.temperature_sensitivity,
            'preferred_inputs': self.preferred_inputs or [],
            'protocol': self.protocol,
            'intervention_threshold': self.intervention_threshold,
            'resting_hr': self.resting_hr,
            'resting_hrv': self.resting_hrv,
            'resting_gsr': self.resting_gsr,
            'resting_temp': self.resting_temp,
        }
