<?php

namespace App\Listeners;

use App\Events\LoanRegistered;
use Illuminate\Support\Facades\Cache;

class BumpBooksCacheVersion
{
    /**
     * Зээл үүссэн тул номын жагсаалтын cache хуучирсан:
     * available_copies буурсан ч cache хуучин утгыг барьсаар байна.
     * Version-ыг нэмснээр бүх хуучин books.v{N}.* түлхүүр хүрэшгүй болж,
     * дараагийн хүсэлт DB-ээс шинээр уншина.
     */
    public function handle(LoanRegistered $event): void
    {
        Cache::put('books.version', Cache::get('books.version', 1) + 1);
    }
}
