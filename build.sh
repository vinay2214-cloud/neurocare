#!/usr/bin/env bash
set -o errexit

# Install Node.js dependencies and build frontend
cd neurocare-frontend
npm install
npm run build
cd ..

# Install Python dependencies
cd neurocare-backend
pip install -r requirements.txt

# Seed database if it doesn't exist
python seed.py || true
