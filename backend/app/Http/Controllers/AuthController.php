<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
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

            // ter hereglegchdee token uusgeh
            $token = $user->createToken('auth_token')->plainTextToken;
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

        return response()->json([
            'user'  => $user->load('company'),   
            'token' => $token,
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
