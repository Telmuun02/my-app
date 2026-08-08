<?php

namespace App\Http\Controllers;

use App\Jobs\SendVerifyEmailJob;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash; 
use Illuminate\Support\Facades\Log;  // pattern 
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // register function
    public function register(Request $request)
    {
        // request iin shaardlaga
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'email'      => 'required|string|email|max:255|unique:users',
            'password'   => 'required|string|min:8|confirmed', // password_confirmation талбар шаардана
            'company_id' => 'required|exists:companies,id',    // байгаа компанийг заасан эсэхийг шалгана
        ]);

        // Debug log.
        Log::debug('Бүртгэлийн хүсэлт боловсруулж байна.', [
            'email' => $validated['email'],
        ]);

        // aldaa oloh
        try {
            // shine user uusgeh gej oroldoh
            $user = User::create([
                'name'       => $validated['name'],
                'email'      => $validated['email'],
                'password'   => Hash::make($validated['password']),
                'company_id' => $validated['company_id'],
            ]);

            // ЭНД token үүсгэхгүй!
            // Хатуу горим: и-мэйл баталгаажтал ямар ч token гарахгүй.
            // Хэрэглэгч мэйл дэх холбоосыг дараад, дараа нь /login-оор нэвтэрнэ.
        } catch (UniqueConstraintViolationException $e) {
            // Email davhtsval.
            Log::warning('Бүртэлтэй и-мэйл байна.', [
                'email' => $validated['email'],
            ]);

            return response()->json(['message' => 'Энэ и-мэйл аль хэдийн бүртгэлтэй байна.'], 409);
        } catch (QueryException $e) {
            // Busad aldaa.
            Log::error('Хэрэглэгч бүртгэхэд өгөгдлийн сангийн алдаа гарлаа.', [
                'email'     => $validated['email'],
                'exception' => $e->getMessage(),
            ]);

            return response()->json(['message' => 'Өгөгдлийн сангийн алдаа гарлаа.'], 500);
        } catch (\Throwable $e) {
            // Throw hiisen aldaa.
            Log::error('Алдаа гарлаа.', [
                'email'     => $validated['email'],
                'exception' => $e->getMessage(),
            ]);

            return response()->json(['message' => 'Хэрэглэгч үүсгэхэд алдаа гарлаа.'], 500);
        }

        // INFO log - user burtgesen g shalgah.
        Log::info('Шинэ хэрэглэгч бүртгэгдлээ.', [
            'user_id' => $user->id,
            'email'   => $user->email,
        ]);

        // Баталгаажуулах и-мэйл илгээх.
        //
        // dispatchSync() — job-ыг queue-д оруулахгүй, энэ хүсэлтийн дотор шууд
        // ажиллуулна. Тиймээс queue:work worker асаах шаардлагагүй.
        //
        // try/catch ЗААВАЛ хэрэгтэй: sync үед job доторх алдаа энд давхиж гардаг.
        // Мэйл яваагүй ч хэрэглэгч аль хэдийн үүссэн тул 500 буцаах нь буруу —
        // алдааг зөвхөн тэмдэглээд, бүртгэлийг амжилттай гэж хариулна.
        // Хэрэглэгч дараа нь /api/email/verification-notification-оор дахин авч болно.
        try {
            SendVerifyEmailJob::dispatchSync($user);
        } catch (\Throwable $e) {
            // Дэлгэрэнгүй лог нь job-ийн failed() дотор аль хэдийн бичигдсэн.
        }

        // Token БАЙХГҮЙ — frontend "мэйлээ шалгана уу" дэлгэц харуулна.
        // 'email'-ыг буцааж байгаа нь тэр дэлгэц дээр хаягийг харуулах,
        // мөн "дахин илгээх" товчинд ашиглахад хэрэгтэй.
        return response()->json([
            'user'    => $user->load('company'),
            'email'   => $user->email,
            'message' => 'Бүртгэл амжилттай. И-мэйл хаягаа баталгаажуулна уу.',
        ], 201);
    }

    
    public function login(Request $request)
    {
        // login shaardlaguud
        $validated = $request->validate([
            'email'    => 'required|string|email',
            'password' => 'required|string',
        ]);

        try {
            // email deer useriig olno, company ni load hiine
            $user = User::where('email', $validated['email'])->with('company')->first();

            // nuuts ug ni taarch baigaag ni shalgah
            if (! $user || ! Hash::check($validated['password'], $user->password)) {
                // Amjiltgu nevtreh uildliig ni medegdeh.
                Log::warning('Амжилтгүй нэвтрэх оролдлого.', [
                    'email' => $validated['email'],
                    'ip'    => $request->ip(),
                ]);

                // aldaa shideh
                throw ValidationException::withMessages([
                    'email' => ['И-мэйл эсвэл нууц үг буруу байна.'],
                ]);
            }

            // ХАТУУ ГОРИМ: и-мэйл баталгаажаагүй бол token огт өгөхгүй.
            // Нууц үг зөв гэдгийг мэдэж байгаа тул email_unverified туг буцаана —
            // frontend үүгээр "дахин илгээх" товчийг харуулна.
            if (! $user->hasVerifiedEmail()) {
                Log::warning('Баталгаажаагүй и-мэйлээр нэвтрэх оролдлого.', [
                    'user_id' => $user->id,
                    'email'   => $user->email,
                ]);

                return response()->json([
                    'message'          => 'И-мэйл хаяг баталгаажаагүй байна. Мэйлээ шалгана уу.',
                    'email_unverified' => true,
                    'email'            => $user->email,
                ], 403);
            }

            // token uusgeh
            $token = $user->createToken('auth_token')->plainTextToken;
        } catch (ValidationException $e) {
            // aldaa shideh
            throw $e;
        } catch (QueryException $e) {
            // Өгөгдлийн сангийн алдаа .
            Log::error('Нэвтрэхэд өгөгдлийн сангийн алдаа гарлаа.', [
                'email'     => $validated['email'],
                'exception' => $e->getMessage(),
            ]);

            return response()->json(['message' => 'Өгөгдлийн сангийн алдаа гарлаа.'], 500);
        } catch (\Throwable $e) {
            // Бусад бүх гэнэтийн алдаа.
            Log::error('Нэвтрэхэд гэнэтийн алдаа гарлаа.', [
                'email'     => $validated['email'],
                'exception' => $e->getMessage(),
            ]);

            return response()->json(['message' => 'Нэвтрэхэд алдаа гарлаа.'], 500);
        }

        // INFO — амжилттай нэвтрэлт
        Log::info('Хэрэглэгч нэвтэрлээ.', [
            'user_id' => $user->id,
            'email'   => $user->email,
        ]);

        return response()->json([
            'user'  => $user,   // company нь дээр with('company')-оор аль хэдийн ачаалагдсан
            'token' => $token,
        ]);
    }

    /**
     * Нэвтэрсэн хэрэглэгчийн мэдээлэл.
     */
    public function me(Request $request)
    {
        // auth:sanctum middleware дамжсан бол $request->user() нь тухайн хэрэглэгч.
        // ard ni load('company') hiih ni company niih ni medeellig hamtad ni butsaana
        return response()->json($request->user()->load('company'));
    }

    /**
     * Гарах — одоогийн token-ыг устгана.
     */
    public function logout(Request $request)
    {   
        // id gaar ni useriig olno
        $userId = $request->user()->id;

        // token iig ni ustgana
        $request->user()->currentAccessToken()->delete();

        // INFO — хэрэглэгч гарсныг тэмдэглэнэ.
        Log::info('Хэрэглэгч гарлаа.', [
            'user_id' => $userId,
        ]);

        return response()->json(['message' => 'Амжилттай гарлаа.']);
    }
}
