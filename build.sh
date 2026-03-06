#!/usr/bin/env bash
set -o errexit

# Install Python dependencies
cd neurocare-backend
pip install -r requirements.txt

# Seed database
python seed.py || true
