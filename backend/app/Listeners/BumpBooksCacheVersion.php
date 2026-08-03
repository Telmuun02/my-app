<?php

namespace App\Listeners;

use App\Events\LoanRegistered;
use Illuminate\Support\Facades\Cache;

// Cache iig loan register uildel hiigdeh uyd ni shine version uusgej shinechleh

class BumpBooksCacheVersion
{
    /**
     * shineer version uusgeh 
     */
    public function handle(LoanRegistered $event): void
    {
        Cache::put('books.version', Cache::get('books.version', 1) + 1);
    }
}
