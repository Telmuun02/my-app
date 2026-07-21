<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Loan;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class LoanController extends Controller
{
    public function index(Request $request)
    {
        $query = Loan::with(['book', 'user']);

        if ($request->user()->role !== 'admin') {
            $query->where('user_id', $request->user()->id);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'book_id'  => 'required|exists:books,id',
            'due_date' => 'required|date|after:today',
        ]);

        $book = Book::findOrFail($validated['book_id']);

        if ($book->available_copies < 1) {
            throw ValidationException::withMessages([
                'book_id' => ['Энэ номын авах боломжтой хувь үлдээгүй байна.'],
            ]);
        }

        $loan = Loan::create([
            'user_id'   => $request->user()->id,
            'book_id'   => $book->id,
            'loan_date' => now()->toDateString(),
            'due_date'  => $validated['due_date'],
        ]);

        $book->decrement('available_copies');

        return response()->json($loan->load('book'), 201);
    }

    public function show(Loan $loan)
    {
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

    public function destroy(Loan $loan)
    {
        if ($loan->return_date === null) {
            $loan->book->increment('available_copies');
        }

        $loan->delete();

        return response()->json(['message' => 'Зээлийн бичлэг устгагдлаа.']);
    }
}
