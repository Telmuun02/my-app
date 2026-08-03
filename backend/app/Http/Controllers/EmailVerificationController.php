<?php

namespace App\Http\Controllers;

use App\Jobs\SendVerifyEmailJob;
use App\Models\User;
use Illuminate\Auth\Events\Verified; // Laravel iin uuriinh event
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EmailVerificationController extends Controller
{
    /**
     * Мэйл дэх холбоосыг дарахад ажиллана.
     *
     * Энэ route-д auth байхгүй — хэрэглэгч мэйлээ хөтчөөс нээж дардаг тул
     * Sanctum token байхгүй. Оронд нь хамгаалалт нь 2 давхар:
     *   1) 'signed' middleware — URL-ийн гарын үсэг + хугацааг шалгана
     *   2) доорх hash шалгалт — холбоосыг тухайн и-мэйл хаягтай холбоно
     */
    public function verify(Request $request, string $id, string $hash)
    {
        $user = User::find($id);

        // hash_equals — тэнцүү эсэхийг тогтмол хугацаанд шалгаж timing attack-аас сэргийлнэ
        if (! $user || ! hash_equals($hash, sha1($user->getEmailForVerification()))) {
            Log::warning('И-мэйл баталгаажуулах буруу холбоос.', ['id' => $id]);

            return redirect($this->frontend('error'));
        }

        if ($user->hasVerifiedEmail()) {
            return redirect($this->frontend('already'));
        }

        $user->markEmailAsVerified();

        // markEmailAsVerified() өөрөө event шиддэггүй тул гараар шидэж байна.
        // Ирээдүйд "тавтай морил" мэйл гэх мэт listener-ийг үүнд хавсаргаж болно.
        event(new Verified($user));

        Log::info('И-мэйл баталгаажлаа.', [
            'user_id' => $user->id,
            'email'   => $user->email,
        ]);

        return redirect($this->frontend('success'));
    }

    /**
     * Баталгаажуулах холбоосыг дахин илгээх (хугацаа дууссан / мэйл ирээгүй тохиолдолд).
     *
     * Энэ route-д auth БАЙХГҮЙ. Шалтгаан: хатуу горимд баталгаажаагүй хэрэглэгчид
     * token огт өгөгддөггүй тул 'auth:sanctum' дор тавибал хэзээ ч хандаж чадахгүй.
     * Оронд нь и-мэйл хаягаар нь хайна.
     */
    public function resend(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|string|email',
        ]);

        $user = User::where('email', $validated['email'])->first();

        // Баталгаажаагүй хэрэглэгч олдсон тохиолдолд Л илгээнэ.
        if ($user && ! $user->hasVerifiedEmail()) {
            try {
                SendVerifyEmailJob::dispatchSync($user);
            } catch (\Throwable $e) {
                // failed() дотор аль хэдийн лог бичигдсэн.
                return response()->json(['message' => 'И-мэйл илгээхэд алдаа гарлаа.'], 500);
            }
        } else {
            Log::info('Дахин илгээх хүсэлт: хэрэглэгч алга эсвэл аль хэдийн баталгаажсан.', [
                'email' => $validated['email'],
            ]);
        }

        // ЧУХАЛ: хэрэглэгч байгаа эсэхээс үл хамааран ИЖИЛ хариу буцаана.
        // Эс бөгөөс энэ endpoint нь "энэ и-мэйл бүртгэлтэй юу?" гэдгийг шалгах
        // хэрэгсэл (email enumeration) болж хувирна.
        return response()->json([
            'message' => 'Хэрэв тухайн и-мэйл бүртгэлтэй бөгөөд баталгаажаагүй бол холбоос илгээгдлээ.',
        ]);
    }

    /**
     * Frontend рүү буцаах хаяг.
     */
    protected function frontend(string $status): string
    {
        return rtrim(config('app.frontend_url'), '/') . '/email-verified?status=' . $status;
    }
}
