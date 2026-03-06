import os
import time
import threading
from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room
from config import get_config
from models import db

socketio = SocketIO(cors_allowed_origins="*", async_mode='threading')

FRONTEND_DIST = os.path.join(os.path.dirname(__file__), '..', 'neurocare-frontend', 'dist')


def create_app():
    app = Flask(__name__, static_folder=FRONTEND_DIST, static_url_path='')
    app.config.from_object(get_config())

    db.init_app(app)
    CORS(app, origins=app.config.get('CORS_ORIGINS', '*').split(','))
    socketio.init_app(app)

    from routes import register_routes
    register_routes(app)

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_frontend(path):
        if path and os.path.exists(os.path.join(FRONTEND_DIST, path)):
            return send_from_directory(FRONTEND_DIST, path)
        return send_from_directory(FRONTEND_DIST, 'index.html')

    with app.app_context():
        db.create_all()

    return app


app = create_app()


@socketio.on('connect')
def handle_connect():
    emit('connected', {'message': 'Connected to NeuroCare'})


@socketio.on('subscribe_sensor')
def handle_subscribe_sensor(data):
    patient_id = data.get('patient_id')
    if patient_id:
        room = f'sensor_{patient_id}'
        join_room(room)
        emit('subscribed', {'room': room, 'patient_id': patient_id})


@socketio.on('subscribe_eds')
def handle_subscribe_eds(data):
    patient_id = data.get('patient_id')
    if patient_id:
        room = f'eds_{patient_id}'
        join_room(room)
        emit('subscribed', {'room': room, 'patient_id': patient_id})


def sensor_stream_worker():
    from services.mock_sensor import patient_scenario
    from services.eds_calculator import EDSCalculator
    from models.user import User

    time.sleep(3)

    while True:
        try:
            with app.app_context():
                patients = User.query.filter_by(role='patient').all()
                for patient in patients:
                    reading = patient_scenario.generate_reading(patient.id)
                    eds_result = EDSCalculator.compute(patient.id, reading)

                    reading['eds'] = eds_result['eds']
                    reading['eds_state'] = eds_result['eds_state']
                    reading['eds_components'] = eds_result['components']

                    socketio.emit('sensor_update', reading, room=f'sensor_{patient.id}')

                    if int(time.time()) % 5 == 0:
                        socketio.emit('eds_update', {
                            'patient_id': patient.id,
                            'eds': eds_result['eds'],
                            'eds_state': eds_result['eds_state'],
                            'components': eds_result['components'],
                            'timestamp': reading['timestamp'],
                        }, room=f'eds_{patient.id}')
        except Exception as e:
            print(f"Sensor stream error: {e}")

        time.sleep(1)


if __name__ == '__main__':
    sensor_mode = os.getenv('SENSOR_MODE', 'mock')
    if sensor_mode == 'mock':
        sensor_thread = threading.Thread(target=sensor_stream_worker, daemon=True)
        sensor_thread.start()
        print("Mock sensor streaming started")

    print("NeuroCare Backend starting on http://localhost:5001")
    socketio.run(app, host='0.0.0.0', port=5001, debug=True, use_reloader=False, allow_unsafe_werkzeug=True)
