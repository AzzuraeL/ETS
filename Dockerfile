# Multi-stage Dockerfile for Laravel + Vite app
# Stage 1: install PHP dependencies (create vendor for node build)
FROM composer:2 AS composer
WORKDIR /app
COPY composer.json composer.lock ./
# Don't run scripts in the composer stage because the application files (like
# `artisan`) aren't copied yet. Run package discovery and other scripts later in
# the final image or entrypoint where the full app is available.
# Also remove the deprecated --no-suggest flag.
RUN composer install --no-dev --prefer-dist --no-progress --no-scripts --optimize-autoloader

# Stage 2: build frontend assets (needs PHP CLI for some Vite plugins)
FROM node:20-bullseye AS node-builder
WORKDIR /app

# Install PHP CLI (>= 8.2) and deps so Vite plugins that call `php artisan`
# can run during the node build. Debian Bullseye ships PHP 7.4 by default,
# so add the SURY repository and install PHP 8.2 CLI and common extensions.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates apt-transport-https gnupg lsb-release wget \
        git unzip libzip-dev libonig-dev libpng-dev \
    && wget -qO - https://packages.sury.org/php/apt.gpg | apt-key add - \
    && echo "deb https://packages.sury.org/php/ bullseye main" > /etc/apt/sources.list.d/php.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
        php8.2-cli php8.2-zip php8.2-mbstring php8.2-curl php8.2-intl php8.2-pgsql php8.2-mysql \
    && rm -rf /var/lib/apt/lists/*

# Copy composer vendor from composer stage so artisan has dependencies
COPY --from=composer /app/vendor /app/vendor

# Copy package files and install node deps
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Copy project files needed for build (resources, vite config, artisan, bootstrap, app, config, routes)
# Wayfinder and other Vite plugins may call `php artisan` during build which requires
# the Laravel bootstrap files to exist (bootstrap/app.php etc.). Copy the minimal
# application directories needed for artisan to bootstrap.
COPY resources resources
COPY vite.config.ts tsconfig.json artisan ./
COPY bootstrap bootstrap
COPY app app
COPY config config
COPY routes routes

# Copy example environment and generate an app key so artisan commands that
# rely on environment values (and encryption) won't fail during the build.
COPY .env.example .env
# Generate APP_KEY (safe to ignore failures)
RUN php artisan key:generate --ansi || true

# Run the frontend build (Vite). Node 20+ required by Vite.
RUN npm run build

# Stage 3: final image
FROM php:8.1-fpm-bullseye
WORKDIR /var/www/html

# System deps
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    libpq-dev \
    libpng-dev \
    libonig-dev \
    && docker-php-ext-install pdo pdo_mysql pdo_pgsql zip

# Copy application files
COPY . /var/www/html

# Copy vendor from composer stage
COPY --from=composer /app/vendor /var/www/html/vendor

# Copy built frontend assets from node stage (Vite outputs to public/build)
COPY --from=node-builder /app/public /var/www/html/public

# Permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache || true

ENV APP_ENV=production
ENV APP_DEBUG=false

EXPOSE 8000

# Entrypoint will run migrations and start artisan serve
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

CMD ["/usr/local/bin/docker-entrypoint.sh"]
