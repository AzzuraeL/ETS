# Multi-stage Dockerfile for Laravel + Vite app
# Stage 1: install PHP dependencies (create vendor for node build)
FROM composer:2 AS composer
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --prefer-dist --no-progress --no-suggest --optimize-autoloader

# Stage 2: build frontend assets (needs PHP CLI for some Vite plugins)
FROM node:20-bullseye AS node-builder
WORKDIR /app

# Install php-cli so Vite plugins that call artisan can run during build
RUN apt-get update \
    && apt-get install -y php-cli git unzip libzip-dev libonig-dev libpng-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy composer vendor from composer stage so artisan has dependencies
COPY --from=composer /app/vendor /app/vendor

# Copy package files and install node deps
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Copy project files needed for build (resources, vite config, artisan, etc.)
COPY resources resources
COPY vite.config.ts tsconfig.json artisan ./

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
