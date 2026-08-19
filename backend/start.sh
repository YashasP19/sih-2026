#!/usr/bin/env bash
set -e
python manage.py migrate --noinput
python manage.py collectstatic --noinput
# Seed demo users/tickets if DB is empty (safe for first boot)
python manage.py seed_civic_data || true
exec gunicorn grievance_system.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 2 --timeout 120
