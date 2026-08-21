FROM php:8.4-cli AS base
RUN apt-get update && apt-get install -y --no-install-recommends \
        git \
        unzip \
        libzip-dev \
        libicu-dev \
        libonig-dev \
        libsqlite3-dev \
        supervisor \
    && docker-php-ext-install -j"$(nproc)" \
        pdo_mysql \
        pdo_sqlite \
        intl \
        zip \
        bcmath \
        mbstring \
    && rm -rf /var/lib/apt/lists/*
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /app


FROM base AS dev
COPY composer.json composer.lock ./
RUN composer install --no-scripts --no-autoloader --prefer-dist
COPY . .
RUN composer dump-autoload --optimize \
    && chmod -R ug+w storage bootstrap/cache
EXPOSE 8000
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]


FROM base AS prod
ENV APP_ENV=production
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist \
    && rm -rf /root/.composer
COPY . .
RUN composer dump-autoload --optimize --no-dev \
    && chmod -R ug+w storage bootstrap/cache \
    && chmod +x initial.sh
EXPOSE 8000
ENTRYPOINT ["/app/initial.sh"]
CMD ["supervisord", "-c", "/app/supervisor.conf"]
