<?php

namespace App\Http\Controllers;

use App\Models\Loan;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use App\Jobs\CreateLoanJob;

// zeelleg san
class LoanController extends Controller
{   
    // list butsaah
    public function index(Request $request)
    {   
        // book, user 2 iig tsugt ni avah  
        $query = Loan::with(['book', 'user']);
        
        if ($request->user()->role !== 'admin') {
            $query->where('user_id', $request->user()->id);
        }

        return response()->json($query->get());
    }

    // create
    public function store(Request $request)
    {   
        // shaardlaa ni 
        $validated = $request->validate([
            'book_id'  => 'required|exists:books,id',
            'due_date' => 'required|date|after:today',
        ]);

        CreateLoanJob::dispatch($validated, $request->user()->id);

        // 202 Accepted — "хүсэлт хүлээн авлаа, боловсруулагдаж байна".
        // 201 Created БИШ, учир нь зээллэг queue-д хараахан үүсээгүй, worker дараа нь үүсгэнэ.
        return response()->json(['message' => 'Зээлийн хүсэлт хүлээн авлаа.'], 202);
    }

    public function show(Loan $loan)
    {
        //
        //users      =>  A, a@gmail.com, 1
        //companies  =>  1, M, 99887766
        return response()->json($loan->load(['book', 'user']));
    }

    public function returnBook(Loan $loan)
    {
        if ($loan->return_date !== null) {
            throw ValidationException::withMessages([
                'loan' => ['Энэ ном аль хэдийн буцаагдсан байна.'],
            ]);
        }

        $loan->update(['return_date' => now()->toDateString()]);

        $loan->book->increment('available_copies');

        return response()->json($loan->load('book'));
    }

    // delete
    public function destroy(Loan $loan)
    {
        if ($loan->return_date === null) {
            $loan->book->increment('available_copies');
        }

        $loan->delete();

        return response()->json(['message' => 'Зээлийн бичлэг устгагдлаа.']);
    }
}
