FROM php:8.4-fpm AS base
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
        opcache \
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

RUN apt-get update && apt-get install -y --no-install-recommends nginx \
    && rm -rf /var/lib/apt/lists/* /etc/nginx/sites-enabled/default \
    && ln -sf /dev/stdout /var/log/nginx/access.log \
    && ln -sf /dev/stderr /var/log/nginx/error.log

COPY nginx.conf    /etc/nginx/conf.d/default.conf
COPY php-fpm.conf  /usr/local/etc/php-fpm.d/zzz-app.conf
COPY opcache.ini   /usr/local/etc/php/conf.d/opcache.ini

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist \
    && rm -rf /root/.composer
COPY . .

RUN composer dump-autoload --optimize --no-dev \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R ug+w storage bootstrap/cache \
    && chmod +x initial.sh
EXPOSE 8000
ENTRYPOINT ["/app/initial.sh"]
CMD ["supervisord", "-c", "/app/supervisor.conf"]
