<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use League\OAuth2\Server\AuthorizationServer;
use League\OAuth2\Server\ResourceServer;
use Throwable;

/**
 * Passport-ийн шифрлэлтийн түлхүүрүүд ачаалагдаж чадаж байгааг шалгана.
 *
 * ЯАГААД ХЭРЭГТЭЙ ВЭ:
 * Passport нь түлхүүрээ ЗАЛХУУГААР (lazy) ачаалдаг. AuthorizationServer нь
 * singleton бөгөөд эхний удаа хэрэг болсон үедээ л үүсдэг. Тиймээс түлхүүргүй
 * контейнер хэвийн асаж, health check давж, зөвхөн ЭХНИЙ хэрэглэгч нэвтрэхийг
 * оролдох үед 500 өгнө — мониторинг "бүх зүйл хэвийн" гэж хэлсээр байх болно.
 *
 * Энэ командыг initial.sh дотор `set -e`-тэй хамт ажиллуулбал алдаа контейнер
 * асах үедээ илэрнэ. Cloud Run тухайн хувилбарыг татгалзаж, хуучин ажиллаж
 * байгаа хувилбараа үргэлжлүүлэн үйлчилнэ — эвдэрсэн deploy хэрэглэгчид
 * хүрэхгүй.
 *
 * Өгөгдлийн сан ШААРДАХГҮЙ: энд зөвхөн объект үүсгэж байгаа болохоос query
 * явуулдаггүй. Тиймээс initial.sh дотор db хүлээх давталтаас ӨМНӨ тавьж болно.
 */
class VerifyPassportKeys extends Command
{
    protected $signature = 'keys:verify';

    protected $description = 'Passport-ийн хувийн болон нийтийн түлхүүр ачаалагдаж байгааг шалгах';

    public function handle(): int
    {
        // Хоёр серверийг ТУСДАА try дотор шалгана.
        //
        // Нэг try дотор багтаавал "алдаа гарлаа" гэдгийг л мэдэх бөгөөд АЛЬ
        // түлхүүр нь эвдэрснийг мэдэхгүй. Энэ код контейнер дотор, Cloud Run-ий
        // лог дээр ажиллана — debugger байхгүй тул алдааны мессеж бол бидний
        // цорын ганц мэдээллийн эх сурвалж.

        // AuthorizationServer → makeCryptKey('private') → ХУВИЙН түлхүүр.
        // Токенд гарын үсэг зурахад ашиглагдана (нэвтрэх үед).
        try {
            app(AuthorizationServer::class);
        } catch (Throwable $e) {
            $this->components->error('Хувийн түлхүүр ачаалагдсангүй: '.$e->getMessage());
            $this->line('  PASSPORT_PRIVATE_KEY орчны хувьсагч, эсвэл');
            $this->line('  storage/oauth-private.key файлыг шалгана уу.');

            return self::FAILURE;
        }

        // ResourceServer → makeCryptKey('public') → НИЙТИЙН түлхүүр.
        // Токен шалгахад ашиглагдана (хамгаалагдсан хүсэлт бүрт).
        //
        // Хоёуланг нь заавал шалгана: зөвхөн нэгийг шалгавал нэвтрэлт нь
        // ажиллаад дараагийн хүсэлт бүр унадаг "хагас эвдэрсэн" deploy
        // амжилттай мэт харагдана. Хагас эвдэрсэн нь бүтэн эвдэрснээс дор.
        try {
            app(ResourceServer::class);
        } catch (Throwable $e) {
            $this->components->error('Нийтийн түлхүүр ачаалагдсангүй: '.$e->getMessage());
            $this->line('  PASSPORT_PUBLIC_KEY орчны хувьсагч, эсвэл');
            $this->line('  storage/oauth-public.key файлыг шалгана уу.');

            return self::FAILURE;
        }

        $this->components->info('Passport-ийн түлхүүрүүд хоёулаа ачаалагдлаа.');

        return self::SUCCESS;
    }
}
