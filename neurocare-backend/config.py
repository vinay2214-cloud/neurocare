import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'neurocare-dev-secret-key-change-in-production')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:5173')
    SENSOR_MODE = os.getenv('SENSOR_MODE', 'mock')
    ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY', '')
    JWT_EXPIRATION_HOURS = 24


class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///neurocare.db')


class ProductionConfig(Config):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///neurocare.db')


config_map = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
}


def get_config():
    env = os.getenv('FLASK_ENV', 'development')
    return config_map.get(env, DevelopmentConfig)
