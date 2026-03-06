from models import db
from datetime import datetime, timezone


class BehavioralEvent(db.Model):
    __tablename__ = 'behavioral_events'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    logged_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    event_type = db.Column(db.String(50), nullable=False)
    severity = db.Column(db.Integer, default=1)
    duration_seconds = db.Column(db.Integer)
    location = db.Column(db.String(50))
    activity = db.Column(db.String(50))
    social_setting = db.Column(db.String(50))
    noise_level = db.Column(db.Integer)
    lighting_level = db.Column(db.Integer)
    screen_time_minutes = db.Column(db.Integer)
    notes = db.Column(db.Text)

    patient = db.relationship('User', foreign_keys=[patient_id], backref=db.backref('behavioral_events', lazy='dynamic'))
    logger = db.relationship('User', foreign_keys=[logged_by])

    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'logged_by': self.logged_by,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'event_type': self.event_type,
            'severity': self.severity,
            'duration_seconds': self.duration_seconds,
            'location': self.location,
            'activity': self.activity,
            'social_setting': self.social_setting,
            'noise_level': self.noise_level,
            'lighting_level': self.lighting_level,
            'screen_time_minutes': self.screen_time_minutes,
            'notes': self.notes,
        }
