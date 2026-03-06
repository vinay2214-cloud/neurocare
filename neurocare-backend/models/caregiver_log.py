from models import db
from datetime import datetime, timezone


class CaregiverDailyLog(db.Model):
    __tablename__ = 'caregiver_daily_logs'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    caregiver_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    sleep_hours = db.Column(db.Float)
    sleep_quality = db.Column(db.Integer)
    meals_regular = db.Column(db.Boolean, default=True)
    diet_notes = db.Column(db.Text)
    medication_taken = db.Column(db.Boolean, default=False)
    medication_notes = db.Column(db.Text)
    mood_morning = db.Column(db.Integer)
    mood_afternoon = db.Column(db.Integer)
    mood_evening = db.Column(db.Integer)
    meltdown_count = db.Column(db.Integer, default=0)
    stimming_level = db.Column(db.Integer)
    social_engagement = db.Column(db.Integer)
    physical_activity_minutes = db.Column(db.Integer, default=0)
    daily_summary = db.Column(db.Text)

    patient = db.relationship('User', foreign_keys=[patient_id], backref=db.backref('caregiver_logs', lazy='dynamic'))
    caregiver = db.relationship('User', foreign_keys=[caregiver_id])

    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'caregiver_id': self.caregiver_id,
            'date': self.date.isoformat() if self.date else None,
            'sleep_hours': self.sleep_hours,
            'sleep_quality': self.sleep_quality,
            'meals_regular': self.meals_regular,
            'diet_notes': self.diet_notes,
            'medication_taken': self.medication_taken,
            'medication_notes': self.medication_notes,
            'mood_morning': self.mood_morning,
            'mood_afternoon': self.mood_afternoon,
            'mood_evening': self.mood_evening,
            'meltdown_count': self.meltdown_count,
            'stimming_level': self.stimming_level,
            'social_engagement': self.social_engagement,
            'physical_activity_minutes': self.physical_activity_minutes,
            'daily_summary': self.daily_summary,
        }
