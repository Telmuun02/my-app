<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|   :users',
            'password' => 'required|string|min:8|confirmed', // password_confirmation талбар шаардана
        ]);

        $n = $request->input("name", "");

        try {
            $user = User::create([
                'name'     => $validated['name'],
                'email'    => $validated['email'],
                'password' => Hash::make($validated['password']),
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;
        } catch (\Exception $e) {
            Log::error('User registration failed: ' . $e->getMessage());
            return response()->json(['message' => 'Хэрэглэгч үүсгэхэд алдаа гарлаа.'], 500);
        }

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

        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['И-мэйл эсвэл нууц үг буруу байна.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

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
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Амжилттай гарлаа.']);
    }
}
