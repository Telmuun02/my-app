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
use Throwable;
use Exception;

/** 
 * Тухайн ажлыг queue-д оруулж, worker нь дараа нь гүйцэтгэнэ.
 */
class CreateLoanJob implements ShouldQueue, ShouldBeUnique
{
    use Queueable;

    public $tries = 3; // retry hiih.
    public $backoff = [5, 10, 15]; // her hugatsaanii daraa hiihee medeh

    // herhen retry hiih ve medeh. 

    /** 
     * anhnii utga buyu parameter uudeer damjuulan ugch bn
     */
    public function __construct(public array $data, public int $userId)
    {   
        // 
    }

    public function uniqueId(): string
    {
        return $this->userId . '-' . $this->data['book_id'];
    }

    /**
     * Worker ajillah zeelleg DB uusne.
     * queue iin hiih uildel ni 
     */
    public function handle(): void
    {

        // transaction hiih
        $loan = DB::transaction(function () {
            $book = Book::lockForUpdate()->find($this->data['book_id']);

            if (! $book || $book->available_copies < 1) {
                Log::warning('Зээл амжилтгүй: ном үлдээгүй', [
                    'book_id' => $this->data['book_id'],
                    'user_id' => $this->userId,
                ]);

                throw new \RuntimeException(
                    'Ном үлдээгүй байна (book_id: ' . $this->data['book_id'] . ')'
                );
            }

            // DB ruu nemeh uil yvts
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

        event(new LoanRegistered($loan));
    }

    public function failed(Throwable $exception): void
    {
        Log::error("CreateLoanJob amjiltgui bolloo.", [
            'user_id' => $this->userId,
            'book_id' => $this->data['book_id'],
            "error" => $exception->getMessage(),
        ]);
    }
}
