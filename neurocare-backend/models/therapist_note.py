from models import db
from datetime import datetime, timezone


class TherapistNote(db.Model):
    __tablename__ = 'therapist_notes'

    id = db.Column(db.Integer, primary_key=True)
    therapist_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    patient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    note_text = db.Column(db.Text, nullable=False)
    linked_event_id = db.Column(db.Integer, db.ForeignKey('behavioral_events.id'), nullable=True)
    note_type = db.Column(db.String(30), default='session')

    therapist = db.relationship('User', foreign_keys=[therapist_id])
    patient = db.relationship('User', foreign_keys=[patient_id], backref=db.backref('therapist_notes', lazy='dynamic'))

    def to_dict(self):
        return {
            'id': self.id,
            'therapist_id': self.therapist_id,
            'patient_id': self.patient_id,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'note_text': self.note_text,
            'linked_event_id': self.linked_event_id,
            'note_type': self.note_type,
        }
