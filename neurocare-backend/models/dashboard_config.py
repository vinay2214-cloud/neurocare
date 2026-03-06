from models import db
from datetime import datetime, timezone


class DashboardConfig(db.Model):
    __tablename__ = 'dashboard_configs'

    id = db.Column(db.Integer, primary_key=True)
    therapist_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    patient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    parameters = db.Column(db.JSON, default=list)
    llm_config = db.Column(db.JSON, default=dict)
    chart_config = db.Column(db.JSON, default=list)
    narrative_text = db.Column(db.Text)
    generated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    is_active = db.Column(db.Boolean, default=True)

    therapist = db.relationship('User', foreign_keys=[therapist_id])
    patient = db.relationship('User', foreign_keys=[patient_id], backref=db.backref('dashboard_configs', lazy='dynamic'))

    def to_dict(self):
        return {
            'id': self.id,
            'therapist_id': self.therapist_id,
            'patient_id': self.patient_id,
            'parameters': self.parameters or [],
            'llm_config': self.llm_config or {},
            'chart_config': self.chart_config or [],
            'narrative_text': self.narrative_text,
            'generated_at': self.generated_at.isoformat() if self.generated_at else None,
            'is_active': self.is_active,
        }
