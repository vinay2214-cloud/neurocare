from models import db
from datetime import datetime, timezone


class ATECRecord(db.Model):
    __tablename__ = 'atec_records'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    date = db.Column(db.Date, nullable=False)
    completed_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    subscale_1 = db.Column(db.Integer, default=0)
    subscale_2 = db.Column(db.Integer, default=0)
    subscale_3 = db.Column(db.Integer, default=0)
    subscale_4 = db.Column(db.Integer, default=0)
    total = db.Column(db.Integer, default=0)
    physical_activity = db.Column(db.String(100))
    adult_time = db.Column(db.String(100))
    speech_therapy = db.Column(db.String(100))
    electronic_device_time = db.Column(db.String(100))
    educational_app_supervised = db.Column(db.String(100))
    educational_app_independent = db.Column(db.String(100))
    video_time = db.Column(db.String(100))

    patient = db.relationship('User', foreign_keys=[patient_id], backref=db.backref('atec_records', lazy='dynamic'))
    completer = db.relationship('User', foreign_keys=[completed_by])

    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'date': self.date.isoformat() if self.date else None,
            'completed_by': self.completed_by,
            'subscale_1': self.subscale_1,
            'subscale_2': self.subscale_2,
            'subscale_3': self.subscale_3,
            'subscale_4': self.subscale_4,
            'total': self.total,
            'physical_activity': self.physical_activity,
            'adult_time': self.adult_time,
            'speech_therapy': self.speech_therapy,
            'electronic_device_time': self.electronic_device_time,
            'educational_app_supervised': self.educational_app_supervised,
            'educational_app_independent': self.educational_app_independent,
            'video_time': self.video_time,
        }
