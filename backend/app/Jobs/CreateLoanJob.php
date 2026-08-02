<?php

namespace App\Jobs;

use App\Events\LoanRegistered;
use App\Models\Book;
use App\Models\Loan;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

// ShouldBeUnique
// event
// back-off
// retry

// redis hiih. 


class CreateLoanJob implements ShouldQueue, ShouldBeUnique
{
    use Queueable;

    // herhen retry hiih ve medeh. 


    public function __construct(public array $data, public int $userId)
    {   
        // 
    }

    public function uniqueId(): string
    {
        return $this->userId . '-' . $this->data['book_id'];
    }

    /**
     * Worker ажиллах үед зээллэг DB-д бичигдэнэ.
     */
    public function handle(): void
    {
        // transaction + lockForUpdate — олон job зэрэг ажиллавал ч нэг номыг 2 удаа
        // зээлэхээс (overselling) хамгаална: номын мөрийг түгжиж, нэг нэгээр боловсруулна.
        $loan = DB::transaction(function () {
            $book = Book::lockForUpdate()->find($this->data['book_id']);

            // Ном үлдээгүй бол зээллэг үүсгэхгүй, зөвхөн тэмдэглэнэ
            if (! $book || $book->available_copies < 1) {
                Log::warning('Зээл амжилтгүй: ном үлдээгүй', [
                    'book_id' => $this->data['book_id'],
                    'user_id' => $this->userId,
                ]);
                return null;
            }

            // Зээллэг ЭНД DB-д бичигдэнэ
            $loan = Loan::create([
                'user_id'   => $this->userId,
                'book_id'   => $book->id,
                'loan_date' => now()->toDateString(),
                'due_date'  => $this->data['due_date'],
            ]);

            // Боломжтой хувийг 1-ээр бууруулна
            $book->decrement('available_copies');

            Log::info('Ном зээлэгдлсэн', [
                'loan_id' => $loan->id,
                'user_id' => $this->userId,
                'book'    => $book->title,
            ]);

            return $loan;
        });

        // Event-ийг transaction commit хийгдсэний ДАРАА ялгаруулна.
        // Дотор нь дуудвал listener commit-оос өмнө ажиллаж, cache-ийг
        // хуучин available_copies-оор дахин дүүргэх эрсдэлтэй.
        // Ном үлдээгүй тохиолдолд $loan нь null тул event ялгарахгүй.
        if ($loan) {
            event(new LoanRegistered($loan));
        }
    }
}
