<?php

use App\Http\Controllers\EmailVerificationController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

/*
|--------------------------------------------------------------------------
| И-мэйл баталгаажуулалт
|--------------------------------------------------------------------------
| Энэ route нь api.php биш web.php дотор байна — учир нь хэрэглэгч үүнийг
| мэйлээсээ хөтчөөр нээж дардаг (JSON API дуудлага биш), эцэст нь frontend
| рүү redirect хийдэг.
|
| Route-ийн нэр ЯГ 'verification.verify' байх ёстой — VerifyEmailMail дотор
| URL::temporarySignedRoute() энэ нэрээр холбоос үүсгэдэг.
*/
Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
    ->middleware('signed')
    ->name('verification.verify');

Route::get('/dashboard', function () {
    return response()->json(['message' => 'Welcome to the dashboard!']);
});

Route::get('/profile', function () {
    return response()->json(['message' => 'This is your profile page.']);
});