<?php

namespace App\Jobs;

use App\Mail\VerifyEmailMail;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

/**
 * Баталгаажуулах и-мэйл илгээх ажил.
 *
 * ЧУХАЛ: одоогоор энэ job-ыг dispatchSync()-ээр дууддаг тул queue worker
 * хэрэггүй — HTTP хүсэлтийн дотор шууд ажиллана. jobs хүснэгт хөндөгдөхгүй.
 *
 * ShouldQueue-г УСТГАЖ БОЛОХГҮЙ: түүнгүйгээр dispatchSync() нь sync queue-ийн
 * дамжлагыг алгасах тул алдаа гарахад failed() дуудагдахгүй, failed_jobs-д ч
 * юу ч бичигдэхгүй болно.
 *
 * Ирээдүйд асинхрон болгох бол controller дахь dispatchSync()-ыг dispatch()
 * болгоход л хангалттай — тэр үед доорх $tries / $backoff амьдарч эхэлнэ.
 */
class SendVerifyEmailJob implements ShouldQueue
{
    use Queueable;

    // Зөвхөн жинхэнэ queue руу шилжсэн үед үйлчилнэ. dispatchSync үед үл хэрэгсэнэ.
    public $tries = 3;
    public $backoff = [10, 30];

    public function __construct(public User $user)
    {
        //
    }

    public function handle(): void
    {
        Mail::to($this->user->email)->send(new VerifyEmailMail($this->user));

        Log::info('Баталгаажуулах и-мэйл илгээгдлээ.', [
            'user_id' => $this->user->id,
            'email'   => $this->user->email,
        ]);
    }

    public function failed(Throwable $exception): void
    {
        Log::error('Баталгаажуулах и-мэйл илгээгдсэнгүй.', [
            'user_id' => $this->user->id,
            'email'   => $this->user->email,
            'error'   => $exception->getMessage(),
        ]);
    }
}
