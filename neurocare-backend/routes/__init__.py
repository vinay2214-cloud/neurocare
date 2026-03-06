from routes.auth import auth_bp
from routes.patients import patients_bp
from routes.emotions import emotions_bp
from routes.sensor_data import sensor_bp
from routes.interventions import interventions_bp
from routes.dashboard import dashboard_bp
from routes.caregiver import caregiver_bp
from routes.atec import atec_bp
from routes.llm_dashboard import llm_dashboard_bp


def register_routes(app):
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(patients_bp, url_prefix='/api/patients')
    app.register_blueprint(emotions_bp, url_prefix='/api/emotions')
    app.register_blueprint(sensor_bp, url_prefix='/api/sensor-data')
    app.register_blueprint(interventions_bp, url_prefix='/api/interventions')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(caregiver_bp, url_prefix='/api/caregiver')
    app.register_blueprint(atec_bp, url_prefix='/api/atec')
    app.register_blueprint(llm_dashboard_bp, url_prefix='/api/therapist')
