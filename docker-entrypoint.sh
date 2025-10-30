#!/usr/bin/env bash
set -e

# Wait for DB if a URL is provided (optional)
if [ -n "$DATABASE_URL" ]; then
  echo "DATABASE_URL is set"
fi

cd /var/www/html

# Ensure app key
if [ -z "${APP_KEY}" ]; then
  php artisan key:generate --ansi
fi

# Run package discovery now that vendor and app files exist in the final image
php artisan package:discover --ansi || true

# Run migrations in production mode (force)
php artisan migrate --force || true

# Storage link if missing
php artisan storage:link || true

# Start built-in server on 0.0.0.0 using provided PORT (Railway sets $PORT)
PORT=${PORT:-8000}
echo "Starting server on port $PORT"
php artisan serve --host=0.0.0.0 --port=${PORT}
