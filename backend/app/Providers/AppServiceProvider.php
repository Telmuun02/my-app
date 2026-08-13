<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

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
