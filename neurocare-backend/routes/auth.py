import jwt
import datetime
from functools import wraps
from flask import Blueprint, request, jsonify, current_app
from models import db
from models.user import User

auth_bp = Blueprint('auth', __name__)


def generate_token(user):
    payload = {
        'user_id': user.id,
        'role': user.role,
        'code': user.code,
        'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(
            hours=current_app.config.get('JWT_EXPIRATION_HOURS', 24)
        ),
    }
    return jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            token = auth_header[7:]
        if not token:
            return jsonify({'error': 'Token required'}), 401
        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                return jsonify({'error': 'User not found'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        return f(current_user, *args, **kwargs)
    return decorated


def role_required(*roles):
    def decorator(f):
        @wraps(f)
        def decorated(current_user, *args, **kwargs):
            if current_user.role not in roles:
                return jsonify({'error': 'Access denied'}), 403
            return f(current_user, *args, **kwargs)
        return decorated
    return decorator


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    code = data.get('code', '').strip()
    role = data.get('role', '').strip()
    name = data.get('name', '').strip()
    email = data.get('email', '').strip() or None
    password = data.get('password', '')

    if not all([code, role, name, password]):
        return jsonify({'error': 'Missing required fields'}), 400

    if role not in ('patient', 'caregiver', 'therapist'):
        return jsonify({'error': 'Invalid role'}), 400

    if User.query.filter_by(code=code).first():
        return jsonify({'error': 'Code already exists'}), 409

    if email and User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already exists'}), 409

    user = User(code=code, role=role, name=name, email=email,
                assigned_patients=data.get('assigned_patients', []))
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    token = generate_token(user)
    return jsonify({'token': token, 'user': user.to_dict()}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    identifier = data.get('email', '').strip() or data.get('code', '').strip()
    password = data.get('password', '')

    if not identifier or not password:
        return jsonify({'error': 'Missing credentials'}), 400

    user = User.query.filter(
        (User.email == identifier) | (User.code == identifier)
    ).first()

    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid credentials'}), 401

    token = generate_token(user)
    return jsonify({'token': token, 'user': user.to_dict()})


@auth_bp.route('/logout', methods=['POST'])
@token_required
def logout(current_user):
    return jsonify({'message': 'Logged out'})


@auth_bp.route('/me', methods=['GET'])
@token_required
def me(current_user):
    return jsonify({'user': current_user.to_dict()})
