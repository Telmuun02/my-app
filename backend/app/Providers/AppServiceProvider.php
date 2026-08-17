<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Laravel\Passport\Passport;

class AppServiceProvider extends ServiceProvider
{
    /**
     * register() метод нь Service Container-д зүйл бүртгэх (bind хийх) 
     * зориулалттай. Өөрөөр хэлбэл: "энэ interface/классыг дуудвал, ийм 
     * зүйл өг" гэж Laravel-д зааж өгдөг газар
     */
    public function register(): void
    {
        //
    }

    /**
     * boot() метод нь бүх Service Provider-ийн register() метод дууссаны 
     * дараа ажилладаг. Энэ мөчид Laravel-ийн бүх сервис, бусад 
     * provider-уудын бүртгэсэн зүйлс бэлэн болсон байдаг тул та 
     * тэдгээрийг чөлөөтэй дуудаж, ашиглаж болно.
     */
    public function boot(): void
    {
        $this->configureRateLimiters();

        if ($this->app->environment('local')) {
            Passport::$validateKeyPermissions = false;
        }

        $this->configureTokenScopes();

        Passport::useAccessTokenEntity(\App\Passport\AccessToken::class);
    }

    /**
     * Токенд олгож болох эрхүүд (scope).
     *
     * Эдгээр нь ТОКЕН дотор хадгалагдана — өгөгдлийн сангаас уншигддаггүй.
     * Тиймээс хэрэглэгчийн role-ыг өөрчилсөн ч ХУУЧИН токен хуучин эрхтэйгээ
     * үлдэнэ; дахин нэвтрэх хүртэл шинэ эрх идэвхжихгүй.
     *
     * Scope нь "ямар ҮЙЛДЭЛ" гэдгийг л мэднэ. "Аль ОБЪЕКТ дээр" гэдгийг
     * мэдэхгүй — тухайлбал 'books:manage' байлаа гэхэд тухайн ном хэрэглэгчийн
     * компанийнх эсэхийг шалгахгүй. Тэрийг контроллер/Policy шалгана.
     */
    protected function configureTokenScopes(): void
    {
        Passport::tokensCan([
            'books:manage'   => 'Ном нэмэх, засах, устгах',
            'catalog:manage' => 'Ангилал, зохиолч удирдах',
            'loans:manage'   => 'Бүх зээллэгийг үзэх, устгах',
        ]);
    }

    /**
     * Нэрлэсэн хязгаарлагчид.
     */
    protected function configureRateLimiters(): void
    {
        RateLimiter::for('verification-emails', fn () => Limit::perMinute(60));
    }
}
