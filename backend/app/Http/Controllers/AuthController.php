<?php

namespace App\Http\Controllers;

use App\Jobs\SendVerifyEmailJob;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash; 
use Illuminate\Support\Facades\Log;   
use Illuminate\Validation\ValidationException;

    /**
     * Хэрэглэгчийн бүртгэл, нэвтрэлт, гарах үйлдлүүд.
     * 
     * register, login, me, logout
     */
class AuthController extends Controller
{
    /**
     * register — шинэ хэрэглэгч бүртгэх.  POST /api/register
     * 
     * хэрэглэгчийн мэдээллийг paremeter ээр авч, хэрэглэгч үүсгэж, баталгаажуулах и-мэйл илгээдэг.
     * Ингэхдээ job ашиглан  mail илгээхийг queue-д оруулна.
     * dispatchSync() ашиглаж байгаа нь queue-д оруулахгүйгээр шууд ажиллуулна гэсэн үг.
     * 
     * Тогтмол log хийсэн учир хамаг мэдээлэл алдаа, амжилттай бүртгэл, нэвтрэлт, гарах үйлдлийг тэмдэглэнэ
     */

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'email'      => 'required|string|email|max:255|unique:users',
            'password'   => 'required|string|min:8|confirmed', // password_confirmation талбар шаардана
            'company_id' => 'required|exists:companies,id',    // байгаа компанийг заасан эсэхийг шалгана
        ]);

        Log::debug('Бүртгэлийн хүсэлт боловсруулж байна.', [
            'email' => $validated['email'],
        ]);

        try {
            $user = User::create([
                'name'       => $validated['name'],
                'email'      => $validated['email'],
                'password'   => Hash::make($validated['password']),
                'company_id' => $validated['company_id'],
            ]);

            // ЭНД token үүсгэхгүй!
            // Хатуу горим: и-мэйл баталгаажтал ямар ч token гарахгүй
        } catch (UniqueConstraintViolationException $e) {
            Log::warning('Бүртэлтэй и-мэйл байна.', [
                'email' => $validated['email'],
            ]);

            return response()->json(['message' => 'Энэ и-мэйл аль хэдийн бүртгэлтэй байна.'], 409);
        } catch (QueryException $e) {
            Log::error('Хэрэглэгч бүртгэхэд өгөгдлийн сангийн алдаа гарлаа.', [
                'email'     => $validated['email'],
                'exception' => $e->getMessage(),
            ]);

            return response()->json(['message' => 'Өгөгдлийн сангийн алдаа гарлаа.'], 500);
        } catch (\Throwable $e) {
            Log::error('Алдаа гарлаа.', [
                'email'     => $validated['email'],
                'exception' => $e->getMessage(),
            ]);

            return response()->json(['message' => 'Хэрэглэгч үүсгэхэд алдаа гарлаа.'], 500);
        }

        Log::info('Шинэ хэрэглэгч бүртгэгдлээ.', [
            'user_id' => $user->id,
            'email'   => $user->email,
        ]);

        try {
            SendVerifyEmailJob::dispatchSync($user);
        } catch (\Throwable $e) {
        }

        return response()->json([
            'user'    => $user->load('company'),
            'email'   => $user->email,
            'message' => 'Бүртгэл амжилттай. И-мэйл хаягаа баталгаажуулна уу.',
        ], 201);
    }

    /**
     * login function хэрэглэгчийн өгсөн мэдээллийг өгөгдлийн сан дахь хэрэглэгчийн
     * мэдээлэлтэй нь харьцуулж, зөв бол token үүсгэнэ.
     * 
     * Энэ тохиолдолд mail хэрэггүй шууд ашиглах боломжтой.
     * 
     * logger байгаа
     */
    
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email'    => 'required|string|email',
            'password' => 'required|string',
        ]);

        try {
            $user = User::where('email', $validated['email'])->with('company')->first();

            if (! $user || ! Hash::check($validated['password'], $user->password)) {
                Log::warning('Амжилтгүй нэвтрэх оролдлого.', [
                    'email' => $validated['email'],
                    'ip'    => $request->ip(),
                ]);

                throw ValidationException::withMessages([
                    'email' => ['И-мэйл эсвэл нууц үг буруу байна.'],
                ]);
            }

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

            // Passport-ийн createToken() нь PersonalAccessTokenResult буцаана.
            // Түүхий JWT нь ->accessToken дотор байна.
            // (Sanctum дээр ->plainTextToken байдаг — Passport дээр тийм
            // property БАЙХГҮЙ тул null болж, нэвтрэлт чимээгүй эвдэрдэг.)
            //
            // Хоёр дахь аргумент нь scope — токен дотор шатаагдана. Админ бүх
            // эрхийг авна. АНХААР: энэ нь токен үүсэх мөчид тогтоогдоно, role
            // дараа өөрчлөгдвөл дахин нэвтрэх хүртэл хуучин эрхтэй хэвээр.
            $scopes = $user->role === 'admin'
                ? ['books:manage', 'catalog:manage', 'loans:manage']
                : [];

            $token = $user->createToken('auth_token', $scopes)->accessToken;
        } catch (ValidationException $e) {
            throw $e;
        } catch (QueryException $e) {
            Log::error('Нэвтрэхэд өгөгдлийн сангийн алдаа гарлаа.', [
                'email'     => $validated['email'],
                'exception' => $e->getMessage(),
            ]);

            return response()->json(['message' => 'Өгөгдлийн сангийн алдаа гарлаа.'], 500);
        } catch (\Throwable $e) {
            Log::error('Нэвтрэхэд гэнэтийн алдаа гарлаа.', [
                'email'     => $validated['email'],
                'exception' => $e->getMessage(),
            ]);

            return response()->json(['message' => 'Нэвтрэхэд алдаа гарлаа.'], 500);
        }

        Log::info('Хэрэглэгч нэвтэрлээ.', [
            'user_id' => $user->id,
            'email'   => $user->email,
        ]);

        return response()->json([
            'user'  => $user,   
            'token' => $token,
        ]);
    }

    /**
     * me function нь одоогийн хэрэглэгчийн мэдээллийг буцаана.  GET /api/me
     * 
     * load() ашигласан учир company мэдээллийг мөн буцаана.
     */
    public function me(Request $request)
    {
        return response()->json($request->user()->load('company'));
    }

    /**
     * Гарах — одоогийн token-ыг устгана.
     */
    public function logout(Request $request)
    {   
        $userId = $request->user()->id;

        // Passport дээр токеныг УСТГАДАГГҮЙ, revoked = true болгож тэмдэглэдэг.
        // Ингэснээр аудитын мөр үлдэж, хэзээ ямар токен цуцлагдсаныг хардаг.
        // (currentAccessToken()->delete() нь Sanctum-ийн API — Passport дээр
        // тийм метод байхгүй.)
        $request->user()->token()->revoke();

        Log::info('Хэрэглэгч гарлаа.', [
            'user_id' => $userId,
        ]);

        return response()->json(['message' => 'Амжилттай гарлаа.']);
    }
}
