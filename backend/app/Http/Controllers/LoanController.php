<?php

namespace App\Http\Controllers;

use App\Jobs\CreateLoanJob;
use App\Models\Loan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/**
 * Номын зээллэгийн CRUD үйлдлүүд.
 *
 * Хэрэглэгчийн зээллийг хадгалах даа queue ашиглан хадгална
 * зээллэгийн хүсэлтийг баталгаажуулахад хугацаа шаардагдана. Энэ нь
 * хэрэглэгчийн хүсэлтийг шууд боловсруулж, 
 * өгөгдлийн санд хадгалахгүй гэсэн үг. Хүсэлтийг queue-д оруулсны дара
 * * нь worker нь зээллэгийг үүсгэж, номын үлдэгдлийг бууруулна.
 */
class LoanController extends Controller
{
    /**
     * Зээллэгийн жагсаалт.  GET /api/loans
     *
     * Админ бүх бичлэгийг, энгийн хэрэглэгч зөвхөн өөрийнхөө бичлэгийг харна.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Loan::with(['book', 'user']);

        if ($request->user()->role !== 'admin') {
            $query->where('user_id', $request->user()->id);
        }

        return response()->json($query->get());
    }

    /**
     * Зээлийн хүсэлт бүртгэх.  POST /api/loans
     *
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'book_id'  => 'required|exists:books,id',
            'due_date' => 'required|date|after:today',
        ]);

        CreateLoanJob::dispatch($validated, $request->user()->id);

        // 202 Accepted — "хүсэлтийг хүлээн авлаа, боловсруулж байна".
        // 201 Created БИШ: зээллэг queue-д хараахан үүсээгүй, worker дараа нь үүсгэнэ.
        // 201 буцаавал клиент бэлэн болоогүй нөөц рүү хандах эрсдэлтэй.
        return response()->json(['message' => 'Зээлийн хүсэлт хүлээн авлаа.'], 202);
    }

    /**
     * Нэг зээллэгийн дэлгэрэнгүй.  GET /api/loans/{loan}
     */
    public function show(Loan $loan): JsonResponse
    {
        return response()->json($loan->load(['book', 'user']));
    }

    /**
     * Ном буцааж хүлээлгэн өгөх.  PUT /api/loans/{loan}/return
     *
     */
    public function returnBook(Loan $loan): JsonResponse
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

    /**
     * Зээллэгийн бичлэг устгах.  DELETE /api/loans/{loan}
     */
    public function destroy(Loan $loan): JsonResponse
    {
        if ($loan->return_date === null) {
            $loan->book->increment('available_copies');
        }

        $loan->delete();

        return response()->json(['message' => 'Зээлийн бичлэг устгагдлаа.']);
    }
}
