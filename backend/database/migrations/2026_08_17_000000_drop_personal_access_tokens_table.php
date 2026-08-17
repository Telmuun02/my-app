<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * personal_access_tokens хүснэгтийг устгана.
 *
 * Энэ хүснэгт нь Laravel Sanctum-ийнх. Төсөл Passport ашигладаг болсон тул
 * (токенууд oauth_access_tokens дотор хадгалагддаг) энэ хүснэгт хэрэггүй
 * болсон бөгөөд Sanctum пакет ч хасагдсан.
 *
 * dropIfExists ашигласан нь: шинэ орчинд Sanctum-ийн анхны migration хэзээ ч
 * ажиллаагүй байж болно — тэр тохиолдолд алдаа шидэхгүй өнгөрнө.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('personal_access_tokens');
    }

    /**
     * Буцаах — Sanctum-ийн анхны бүтцийг сэргээнэ.
     *
     * down() нь up()-ыг үнэхээр буцаадаг байх ёстой. Хоосон орхивол
     * migrate:rollback ажиллаад ямар ч нөлөөгүй өнгөрч, дараагийн migrate
     * "хүснэгт аль хэдийн байхгүй" гэсэн буруу таамаглал дээр ажиллана.
     */
    public function down(): void
    {
        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->morphs('tokenable');
            $table->string('name');
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }
};
