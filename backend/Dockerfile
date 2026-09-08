
## suuri heseg
FROM php:8.4-fpm AS base

## orchin dahi shaardlagatai library nuudiig tatath
RUN apt-get update && apt-get install -y --no-install-recommends \
        git \
        unzip \
        libzip-dev \
        libicu-dev \
        supervisor \
    && rm -rf /var/lib/apt/lists/*

## tusgai script uud 
RUN docker-php-ext-install -j"$(nproc)" \
        pdo_mysql \
        intl \
        zip \
        bcmath

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app


FROM base AS dev

COPY . .

RUN composer install

EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]

FROM base AS prod

ENV APP_ENV=production

RUN apt-get update && apt-get install -y --no-install-recommends nginx \
    && rm -rf /var/lib/apt/lists/*

RUN rm /etc/nginx/sites-enabled/default

RUN ln -sf /dev/stderr /var/log/nginx/error.log

COPY nginx.conf    /etc/nginx/conf.d/default.conf

COPY . .

RUN composer install --no-dev --optimize-autoloader

RUN chown -R www-data:www-data storage bootstrap/cache

RUN chmod +x initial.sh

EXPOSE 8000

ENTRYPOINT ["/app/initial.sh"]
