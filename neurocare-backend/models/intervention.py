from models import db
from datetime import datetime, timezone


class Intervention(db.Model):
    __tablename__ = 'interventions'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    trigger_eds = db.Column(db.Float)
    trigger_state = db.Column(db.String(20))
    intervention_type = db.Column(db.String(50), nullable=False)
    duration_seconds = db.Column(db.Integer)
    outcome = db.Column(db.String(20))
    eds_before = db.Column(db.Float)
    eds_after = db.Column(db.Float)
    notes = db.Column(db.Text)

    patient = db.relationship('User', backref=db.backref('interventions', lazy='dynamic'))

    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'trigger_eds': self.trigger_eds,
            'trigger_state': self.trigger_state,
            'intervention_type': self.intervention_type,
            'duration_seconds': self.duration_seconds,
            'outcome': self.outcome,
            'eds_before': self.eds_before,
            'eds_after': self.eds_after,
            'notes': self.notes,
        }
