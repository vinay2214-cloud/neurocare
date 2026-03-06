from models import db
from datetime import datetime, timezone
import bcrypt


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(20), unique=True, nullable=False, index=True)
    role = db.Column(db.String(20), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(200), unique=True, nullable=True)
    password_hash = db.Column(db.String(200), nullable=False)
    assigned_patients = db.Column(db.JSON, default=list)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def set_password(self, password):
        self.password_hash = bcrypt.hashpw(
            password.encode('utf-8'), bcrypt.gensalt()
        ).decode('utf-8')

    def check_password(self, password):
        return bcrypt.checkpw(
            password.encode('utf-8'),
            self.password_hash.encode('utf-8')
        )

    def to_dict(self):
        return {
            'id': self.id,
            'code': self.code,
            'role': self.role,
            'name': self.name,
            'email': self.email,
            'assigned_patients': self.assigned_patients or [],
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
