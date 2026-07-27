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
    public function register(Request $request)
    {
        
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed', // password_confirmation талбар шаардана
        ]);

        // DEBUG — хөгжүүлэлтийн дэлгэрэнгүй мэдээлэл (хүсэлт ирснийг тэмдэглэнэ).
        Log::debug('Бүртгэлийн хүсэлт боловсруулж байна.', [
            'email' => $validated['email'],
        ]);

        try {
            $user = User::create([
                'name'     => $validated['name'],
                'email'    => $validated['email'],
                'password' => Hash::make($validated['password']),
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;
        } catch (UniqueConstraintViolationException $e) {
            // Email давхцал DB түвшинд — validation-ийг давсан ховор тохиолдол (жишээ нь зэрэг хүсэлт).
            Log::warning('Бүртэлтэй и-мэйл байна.', [
                'email' => $validated['email'],
            ]);

            return response()->json(['message' => 'Энэ и-мэйл аль хэдийн бүртгэлтэй байна.'], 409);
        } catch (QueryException $e) {
            // Өгөгдлийн сангийн бусад алдаа — холбогдохгүй байх, constraint зөрчил гэх мэт.
            Log::error('Хэрэглэгч бүртгэхэд өгөгдлийн сангийн алдаа гарлаа.', [
                'email'     => $validated['email'],
                'exception' => $e->getMessage(),
            ]);

            return response()->json(['message' => 'Өгөгдлийн сангийн алдаа гарлаа.'], 500);
        } catch (\Throwable $e) {
            // Бусад бүх гэнэтийн алдаа.
            Log::error('Алдаа гарлаа.', [
                'email'     => $validated['email'],
                'exception' => $e->getMessage(),
            ]);

            return response()->json(['message' => 'Хэрэглэгч үүсгэхэд алдаа гарлаа.'], 500);
        }

        // INFO — амжилттай, чухал үйл явдал (аудитын мөр).
        Log::info('Шинэ хэрэглэгч бүртгэгдлээ.', [
            'user_id' => $user->id,
            'email'   => $user->email,
        ]);

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ], 201);
    }

    
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email'    => 'required|string|email',
            'password' => 'required|string',
        ]);

        try {
            $user = User::where('email', $validated['email'])->first();

            if (! $user || ! Hash::check($validated['password'], $user->password)) {
                // Амжилтгүй нэвтрэх оролдлогыг бүртгэнэ — аюулгүй байдлын log-д хэрэгтэй.
                Log::warning('Амжилтгүй нэвтрэх оролдлого.', [
                    'email' => $validated['email'],
                    'ip'    => $request->ip(),
                ]);

                throw ValidationException::withMessages([
                    'email' => ['И-мэйл эсвэл нууц үг буруу байна.'],
                ]);
            }

            $token = $user->createToken('auth_token')->plainTextToken;
        } catch (ValidationException $e) {
            // Буруу нэвтрэлт — энд бариулахгүй, Laravel-д даатгаж 422 болгоно.
            throw $e;
        } catch (QueryException $e) {
            // Өгөгдлийн сангийн алдаа — холбогдохгүй байх гэх мэт.
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

        // INFO — амжилттай нэвтрэлт (хэн, хэзээ нэвтэрснийг тэмдэглэнэ).
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
     * Нэвтэрсэн хэрэглэгчийн мэдээлэл.
     */
    public function me(Request $request)
    {
        // auth:sanctum middleware дамжсан бол $request->user() нь тухайн хэрэглэгч
        return response()->json($request->user());
    }

    /**
     * Гарах — одоогийн token-ыг устгана.
     */
    public function logout(Request $request)
    {
        $userId = $request->user()->id;

        $request->user()->currentAccessToken()->delete();

        // INFO — хэрэглэгч гарсныг тэмдэглэнэ.
        Log::info('Хэрэглэгч гарлаа.', [
            'user_id' => $userId,
        ]);

        return response()->json(['message' => 'Амжилттай гарлаа.']);
    }
}
