<?php

namespace App\Jobs;

use App\Mail\VerifyEmailMail;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\Middleware\RateLimited;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

/**
 * batalgaajuulah mail iig ilgeeh job
 * 
 * ingehdee dispatchSync() ashiglaj baigaa uchir queue odoohondoo ashiglahgu 
 */
class SendVerifyEmailJob implements ShouldQueue
{
    use Queueable;

    // queue ruu shiljih uyd l hereg boloh heseg
    public $tries = 3;
    public $backoff = [10, 30];

    
    public function __construct(public User $user)
    {
        // baiguulagch
    }

    public function middleware(): array
    {
        return [(new RateLimited('verification-emails'))->dontRelease()];
    }

    public function handle(): void
    {
        // mail ilgeej bn
        Mail::to($this->user->email)->send(new VerifyEmailMail($this->user));

        // log hiih
        Log::info('Баталгаажуулах и-мэйл илгээгдлээ.', [
            'user_id' => $this->user->id,
            'email'   => $this->user->email,
        ]);
    }

    // exception uusvel hiih uildel 
    public function failed(Throwable $exception): void
    {
        Log::error('Баталгаажуулах и-мэйл илгээгдсэнгүй.', [
            'user_id' => $this->user->id,
            'email'   => $this->user->email,
            'error'   => $exception->getMessage(),
        ]);
    }
}
