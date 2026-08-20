#!/bin/sh

set -e

echo "==> Өгөгдлийн сан бэлэн болохыг хүлээж байна..."
until php artisan db:show > /dev/null 2>&1; do
    echo "    ...хүлээж байна"
    sleep 2
done
echo "==> Өгөгдлийн сан бэлэн боллоо."

php artisan config:clear
php artisan route:clear
php artisan migrate --force
php artisan cache:clear

echo "==> Ажиллуулж байна: $*"
exec "$@"
