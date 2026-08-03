<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\EmailVerificationController;
use App\Http\Controllers\AuthorController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\LoanController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Нээлттэй route-ууд (нэвтрэхгүйгээр хандах боломжтой)
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Баталгаажуулах холбоосыг дахин илгээх — НЭЭЛТТЭЙ байх ёстой.
// Хатуу горимд баталгаажаагүй хэрэглэгчид token байхгүй тул auth дор тавьж болохгүй.
// throttle:5,1 — минутад 5 удаа. Үүнгүйгээр спам илгээх суваг болно.
Route::post('/email/verification-notification', [EmailVerificationController::class, 'resend'])
    ->middleware('throttle:5,1')
    ->name('verification.send');

// Ном, ангилал, зохиолчийг зочид ч үзэж болно (жагсаах + харах)
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);
Route::get('/authors', [AuthorController::class, 'index']);
Route::get('/authors/{author}', [AuthorController::class, 'show']);
Route::get('/books', [BookController::class, 'index']);
Route::get('/books/{book}', [BookController::class, 'show']);

// prefix
// mailable
// config
// mail -> smtp eer ashiglana. 587

/*
|--------------------------------------------------------------------------
| Нэвтэрсэн хэрэглэгч
|--------------------------------------------------------------------------
| Хатуу горимд token нь зөвхөн баталгаажсан хэрэглэгчид олгогддог тул
| энд байгаа хэн боловч аль хэдийн баталгаажсан байна.
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
});

// 'verified' middleware нь JSON бус хүсэлтийг энэ нэртэй route руу чиглүүлэхийг
// оролддог тул тодорхойлж өгөх шаардлагатай.
Route::get('/email/verify', fn () => response()->json([
    'message' => 'И-мэйл хаягаа баталгаажуулна уу.',
], 403))->name('verification.notice');

/*
|--------------------------------------------------------------------------
| Хамгаалагдсан route-ууд (token + и-мэйл баталгаажсан байх шаардана)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    // Ангилал / Зохиолч / Ном — үүсгэх, засах, устгах
    Route::apiResource('categories', CategoryController::class)->except(['index', 'show']);
    Route::apiResource('authors', AuthorController::class)->except(['index', 'show']);
    Route::apiResource('books', BookController::class)->except(['index', 'show']);

    // Зээл — бүх үйлдэл нэвтэрсэн хэрэглэгчид
    Route::get('/loans', [LoanController::class, 'index']);
    Route::post('/loans', [LoanController::class, 'store']);
    Route::get('/loans/{loan}', [LoanController::class, 'show']);
    Route::put('/loans/{loan}/return', [LoanController::class, 'returnBook']);
    Route::delete('/loans/{loan}', [LoanController::class, 'destroy']);
});
