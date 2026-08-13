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
 * store буюу update хийх үед ээ queue ашиглаж байгаа.
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
        // Ном, хэрэглэгчийг урьдчилан ачаалж байна. Үгүй бол жагсаалтын мөр бүрт
        // нэмэлт хоёр асуулга явж N+1 асуудал үүснэ.
        $query = Loan::with(['book', 'user']);

        // Эрхийн хязгаарлалт: админ биш бол бусдын зээллэг харагдахгүй.
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
        // Давхар буцаалтаас хамгаална — эс бөгөөс available_copies нэг номын
        // хувьд олон удаа нэмэгдэж, бодит үлдэгдлээс их болно.
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
        // Буцаагдаагүй байхад устгаж байгаа бол тухайн хувь эргэж ирэхгүй тул
        // үлдэгдлийг энд нөхөж нэмнэ. Буцаагдсан бол returnBook() аль хэдийн
        // нэмсэн байгаа — давхар нэмэхээс сэргийлж нөхцөл шалгав.
        if ($loan->return_date === null) {
            $loan->book->increment('available_copies');
        }

        $loan->delete();

        return response()->json(['message' => 'Зээлийн бичлэг устгагдлаа.']);
    }
}
