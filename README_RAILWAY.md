# Deploying this Laravel app to Railway (Docker)

This repository includes a Dockerfile and helper scripts to run on Railway via Docker. Quick steps:

1. Create a Railway project and connect your GitHub repo.
2. Set environment variables in Railway (recommended):
   - APP_KEY (optional, if omitted the container will generate one)
   - APP_ENV=production
   - APP_DEBUG=false
   - DATABASE_URL (Railway provides a Postgres URL)
   - Other Laravel vars (MAIL_*, etc.)

3. Railway will build the Dockerfile. The container runs migrations and starts the built-in PHP server on the exposed port.

Notes:
- This Dockerfile uses `php artisan serve` which is simple for small apps. For production-grade deployments consider using php-fpm + nginx and a proper process manager.
- Make sure you do not commit secrets; Railway stores environment variables securely.
- If you prefer not to use Docker, configure Railway to run `composer install` and `npm ci && npm run build` in the build steps and use the provided `Procfile` to start the app.
