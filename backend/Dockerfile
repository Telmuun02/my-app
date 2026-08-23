# -cli БИШ -fpm. Энэ image нь php-fpm-ээс гадна CLI binary-г МӨН агуулдаг тул
# composer, artisan, dev дэх `php -S` бүгд хэвээр ажиллана. Prod-д нэмж
# php-fpm гарч ирнэ.
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

# nginx-ыг зөвхөн энд суулгана — dev-д хэрэггүй тул тэр image жижиг үлдэнэ.
# Debian-ийн багц нь 80 порт дээрх өөрийн сайтыг идэвхжүүлдэг тул устгана,
# эс бөгөөс манай тохиргоотой мөргөлдөнө.
# Логийн файлуудыг контейнерийн урсгал руу холбоно — `docker logs` ажиллана.
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
# chown нь ЗААВАЛ. php-fpm-ийн worker-ууд www-data хэрэглэгчээр ажилладаг
# (www.conf-ийн анхдагч), гэтэл COPY хийсэн файлууд root эзэмшилтэй байна.
# Тэгвэл Laravel нь session, cache, view, log бичиж чадахгүй — хүсэлт бүр
# "tempnam(): file created in the system's temporary directory" гэж унана.
#
# `php -S` үед энэ асуудал БАЙГААГҮЙ, учир нь тэр root-оор ажилладаг байсан.
# Зөвхөн php-fpm руу шилжихэд гарч ирдэг далд урхи.
RUN composer dump-autoload --optimize --no-dev \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R ug+w storage bootstrap/cache \
    && chmod +x initial.sh
EXPOSE 8000
ENTRYPOINT ["/app/initial.sh"]
CMD ["supervisord", "-c", "/app/supervisor.conf"]
