# syntax=docker/dockerfile:1

# =============================================================================
# Laravel backend — олон шаттай (multi-stage) build.
#
#   base  → PHP + өргөтгөлүүд (dev, prod хоёулаа эндээс үүснэ)
#   dev   → dev хамаарлууд + composer үлдэнэ (artisan test, tinker ажиллана)
#   prod  → зөвхөн ажиллуулахад хэрэгтэй нь
#
# Аль шатыг барихыг compose дахь `target:` шийднэ.
# =============================================================================


# ---------------------------------------------------------------- base -----
FROM php:8.4-cli AS base

# Өргөтгөл бүрийн шалтгаан:
#   pdo_mysql  — аппын өгөгдлийн сан
#   pdo_sqlite — phpunit.xml нь sqlite :memory: ашигладаг; үүнгүйгээр тест унана
#   intl       — Laravel-ийн локалчлал/огноо
#   zip        — composer нь пакетуудыг задлахад
#   bcmath     — Passport-ийн токен тооцоололд
#
# lib*-dev багцуудыг үлдээсэн: тэдгээрийг устгавал image ~40MB багасах ч
# нэмэлт өргөтгөл суулгах бүрд дахин суулгах шаардлагатай болно. Сурах
# шатанд энгийн байх нь илүү үнэ цэнэтэй.
RUN apt-get update && apt-get install -y --no-install-recommends \
        git \
        unzip \
        libzip-dev \
        libicu-dev \
        libonig-dev \
        libsqlite3-dev \
    && docker-php-ext-install -j"$(nproc)" \
        pdo_mysql \
        pdo_sqlite \
        intl \
        zip \
        bcmath \
        mbstring \
    && rm -rf /var/lib/apt/lists/*

# Composer-ыг албан ёсны image-ээс хуулж авна — өөрөө суулгахаас найдвартай,
# хувилбар нь тогтмол.
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app


# ----------------------------------------------------------------- dev -----
FROM base AS dev

# Эхлээд ЗӨВХӨН хамаарлын файлуудыг хуулна. Docker давхарга бүрийг кэшлэдэг
# тул аппын код өөрчлөгдөхөд composer install дахин ажиллахгүй — зөвхөн
# composer.json/lock өөрчлөгдөхөд л ажиллана. Build хэд дахин хурдан болно.
COPY composer.json composer.lock ./

# --no-scripts: post-install скриптүүд аппын файлуудыг шаарддаг, тэдгээр нь
#               хараахан хуулагдаагүй байна
# --no-autoloader: autoload-ыг код хуулсны дараа үүсгэнэ
RUN composer install --no-scripts --no-autoloader --prefer-dist

COPY . .

RUN composer dump-autoload --optimize \
    && chmod -R ug+w storage bootstrap/cache

EXPOSE 8000

# Хөгжүүлэлтэд artisan serve хангалттай. 0.0.0.0 заавал —
# 127.0.0.1 бол контейнерийн ДОТОР л сонсох тул гаднаас холбогдож чадахгүй.
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]


# ---------------------------------------------------------------- prod -----
FROM base AS prod

ENV APP_ENV=production

COPY composer.json composer.lock ./

# --no-dev: phpunit, faker зэрэг хөгжүүлэлтийн пакетууд production-д хэрэггүй
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist \
    && rm -rf /root/.composer

COPY . .

RUN composer dump-autoload --optimize --no-dev \
    && chmod -R ug+w storage bootstrap/cache

EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
