<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Laravel\Passport\Passport;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureRateLimiters();

        /*
         * Passport-ийн түлхүүрийн эрхийн шалгалт.
         *
         * league/oauth2-server нь хувийн түлхүүрийн эрх 600/660 байхыг шаарддаг.
         * Docker дээр Windows-ийн хавтас bind mount хийгдэхэд файлын систем
         * БҮХ файлыг 777 гэж мэдээлдэг — chmod хийсэн ч өөрчлөгддөггүй, учир нь
         * Windows дээр POSIX эрх гэж байхгүй.
         *
         * Тиймээс хөгжүүлэлтийн орчинд шалгалтыг унтраана. Production-д
         * (жинхэнэ Linux файлын систем дээр) шалгалт ХЭВЭЭР үлдэнэ — тэнд
         * энэ нь хамгаалалтын бодит утгатай.
         */
        if ($this->app->environment('local')) {
            Passport::$validateKeyPermissions = false;
        }
    }

    /**
     * Нэрлэсэн хязгаарлагчид.
     */
    protected function configureRateLimiters(): void
    {
        /*
         * Баталгаажуулах и-мэйл — минутад хамгийн ихдээ 60.
         *
         * Энэ нь БҮХ хэрэглэгчийг нийтэд нь хамарсан дээд хязгаар (->by() өгөөгүй
         * тул түлхүүр нь хязгаарлагчийн нэр өөрөө). Зорилго нь SMTP нийлүүлэгчийн
         * квотыг хамгаалах.
         *
         * Хэрэглэгч тус бүрээр хязгаарлахыг хүсвэл:
         *   return Limit::perMinute(60)->by($job->user->id);
         *
         * Хүсэлт бүрийн түвшний хамгаалалт нь үүнээс тусдаа — routes/api.php дээрх
         * throttle:5,1 нь нэг IP-г минутад 5 удаагаар хязгаарладаг.
         */
        RateLimiter::for('verification-emails', fn () => Limit::perMinute(60));
    }
}
