#!/usr/bin/env bash
#
# =============================================================================
# Backend контейнерийн эхлүүлэх скрипт (docker-compose дахь entrypoint).
#
# Ажиллах дараалал:
#   1. MySQL бэлэн болтол хүлээнэ
#   2. Тохиргоог бүрдүүлнэ (vendor, APP_KEY, миграц, Passport, seed)
#   3. Эцэст нь compose-оос ирсэн командыг ажиллуулна (`exec "$@"`)
#
# ИДЕМПОТЕНТ: алхам бүр "аль хэдийн хийгдсэн үү" гэж шалгана. Контейнер дахин
# эхлэх бүрд ажилладаг тул энэ нь ЗААВАЛ байх шинж — эс бөгөөс restart болгонд
# өгөгдөл давхарлагдана.
#
# SETUP=0 үед тохиргоог алгасаад зөвхөн хүлээнэ. Queue контейнер үүнийг
# ашиглана — хоёр контейнер зэрэг composer install ажиллуулбал нэг volume
# дээр мөргөлдөнө.
# =============================================================================

set -euo pipefail

cd /app

SETUP="${SETUP:-1}"

step() { printf '\n\033[1;32m▶ %s\033[0m\n' "$1"; }
skip() { printf '  \033[0;33m↷ %s\033[0m\n' "$1"; }
ok()   { printf '  \033[0;36m✓ %s\033[0m\n' "$1"; }

# Өгөгдлийн сангаас ганц утга уншина.
# mysql клиент энэ image дотор БАЙХГҮЙ тул PHP-ийн PDO-г ашиглана.
# Алдаа гарвал (хүснэгт байхгүй г.м.) "0" буцаана.
db_scalar() {
    SQL="$1" php -r '
        try {
            $pdo = new PDO(
                sprintf("mysql:host=%s;port=%s;dbname=%s",
                    getenv("DB_HOST"), getenv("DB_PORT") ?: "3306", getenv("DB_DATABASE")),
                getenv("DB_USERNAME"), getenv("DB_PASSWORD")
            );
            echo (string) $pdo->query(getenv("SQL"))->fetchColumn();
        } catch (Throwable $e) { echo "0"; }
    ' 2>/dev/null || echo "0"
}

# --------------------------------------------------------------------- 1 ---
# MySQL контейнер асаад л шууд холболт хүлээж авдаггүй — дотоод бэлтгэл нь
# 10-20 секунд үргэлжилнэ. Хүлээхгүй бол migrate "Connection refused" өгнө.
step "MySQL-ийг хүлээж байна"
tries=0
until php -r '
    try {
        new PDO(
            sprintf("mysql:host=%s;port=%s;dbname=%s",
                getenv("DB_HOST"), getenv("DB_PORT") ?: "3306", getenv("DB_DATABASE")),
            getenv("DB_USERNAME"), getenv("DB_PASSWORD")
        );
        exit(0);
    } catch (Throwable $e) { exit(1); }
' 2>/dev/null; do
    tries=$((tries + 1))
    if [ "$tries" -ge 60 ]; then
        echo "MySQL 2 минутын дотор бэлэн болсонгүй. Шалгах: docker compose logs db" >&2
        exit 1
    fi
    sleep 2
done
ok "MySQL холболт бэлэн"

# SETUP=0 (queue контейнер) — тохиргоог backend хийж дуустал хүлээгээд гарна.
if [ "$SETUP" != "1" ]; then
    step "Тохиргоог (backend контейнер) хүлээж байна"
    tries=0
    until [ -f vendor/autoload.php ] && [ "$(db_scalar 'SELECT COUNT(*) FROM migrations')" -gt 0 ]; do
        tries=$((tries + 1))
        if [ "$tries" -ge 90 ]; then
            echo "Тохиргоо дуусахыг хэт удаан хүлээлээ." >&2
            exit 1
        fi
        sleep 2
    done
    ok "Тохиргоо бэлэн — команд руу шилжиж байна"
    exec "$@"
fi

# --------------------------------------------------------------------- 2 ---
step "Composer хамаарлууд"
if [ -f vendor/autoload.php ]; then
    skip "vendor аль хэдийн суусан"
else
    composer install --no-interaction
    ok "vendor суулаа"
fi

# --------------------------------------------------------------------- 3 ---
step "APP_KEY"
if grep -qE '^APP_KEY=base64:.+' .env 2>/dev/null; then
    skip "APP_KEY аль хэдийн үүссэн"
else
    php artisan key:generate --no-interaction
    ok "APP_KEY үүсгэлээ"
fi

# --------------------------------------------------------------------- 4 ---
step "Миграцууд"
# migrate өөрөө идемпотент — ажиллаагүй файлуудыг л ажиллуулна.
php artisan migrate --force --no-interaction
ok "Хүснэгтүүд бэлэн"

# --------------------------------------------------------------------- 5 ---
step "Passport-ийн түлхүүрүүд"
# Эдгээр нь gitignore-д тул шинэ clone / шинэ volume дээр ХЭЗЭЭ Ч байхгүй.
# Үүнгүйгээр нэвтрэлт чимээгүй эвдэрнэ — хамгийн олон мартагддаг алхам.
if [ -f storage/oauth-private.key ] && [ -f storage/oauth-public.key ]; then
    skip "oauth түлхүүрүүд байна"
else
    php artisan passport:keys --no-interaction
    ok "oauth түлхүүрүүд үүсгэлээ"
fi

# --------------------------------------------------------------------- 6 ---
step "Passport-ийн personal access client"
# AuthController нь $user->createToken(...) ашигладаг — энэ нь grant_types-д
# 'personal_access' агуулсан client шаарддаг. Байхгүй бол алдаа нь SETUP үед
# биш, ХЭРЭГЛЭГЧ НЭВТРЭХ үед гарч ирдэг тул олоход төвөгтэй.
clients=$(db_scalar "SELECT COUNT(*) FROM oauth_clients WHERE grant_types LIKE '%personal_access%'")
if [ "${clients:-0}" -gt 0 ]; then
    skip "personal access client байна ($clients ш)"
else
    php artisan passport:client --personal \
        --name="Folio Personal Access Client" --no-interaction
    ok "personal access client үүсгэлээ"
fi

# --------------------------------------------------------------------- 7 ---
step "Жишээ өгөгдөл"
books=$(db_scalar "SELECT COUNT(*) FROM books")
if [ "${books:-0}" -gt 0 ]; then
    skip "Санд $books ном байна — seed алгаслаа"
else
    php artisan db:seed --force --no-interaction
    ok "Жишээ өгөгдөл нэмэгдлээ"
fi

# --------------------------------------------------------------------- 8 ---
cat <<'EOF'

╭──────────────────────────────────────────────────────────╮
│  Backend бэлэн                                           │
│    API     http://localhost:8000/api                     │
│    Апп     http://localhost:5173                         │
│    Мэйл    http://localhost:8025   (Mailpit)             │
╰──────────────────────────────────────────────────────────╯

EOF

# exec — bash нь өөрийгөө командаар СОЛИНО. Ингэснээр PID 1 нь артизан болж,
# `docker compose stop` илгээсэн дохиог шууд хүлээж авна. exec-гүй бол дохио
# bash дээр гацаж, контейнер 10 секунд хүлээгээд албадан унтардаг.
exec "$@"
