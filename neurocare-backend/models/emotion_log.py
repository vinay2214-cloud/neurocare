from models import db
from datetime import datetime, timezone


class EmotionLog(db.Model):
    __tablename__ = 'emotion_logs'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    emoji_id = db.Column(db.Integer, nullable=False)
    emoji_name = db.Column(db.String(50), nullable=False)
    intensity = db.Column(db.Integer, nullable=False, default=3)
    source = db.Column(db.String(30), default='patient_self')
    context_location = db.Column(db.String(50))
    context_activity = db.Column(db.String(50))
    social_environment = db.Column(db.String(50))
    notes = db.Column(db.Text)

    patient = db.relationship('User', backref=db.backref('emotion_logs', lazy='dynamic'))

    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'emoji_id': self.emoji_id,
            'emoji_name': self.emoji_name,
            'intensity': self.intensity,
            'source': self.source,
            'context_location': self.context_location,
            'context_activity': self.context_activity,
            'social_environment': self.social_environment,
            'notes': self.notes,
        }
