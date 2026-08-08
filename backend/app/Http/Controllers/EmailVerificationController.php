<?php

namespace App\Http\Controllers;

use App\Jobs\SendVerifyEmailJob;
use App\Models\User;
use Illuminate\Auth\Events\Verified; // Laravel iin uuriinh event
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

// verify route ruu handahad ajillah controller
class EmailVerificationController extends Controller
{
    /**
     * verify hiih function
     */
    public function verify(Request $request, string $id, string $hash)
    {
        $user = User::find($id); // user iig oloh

        // user iig oldohgui, esvel hash buruu bol redirect hiine.
        if (! $user || ! hash_equals($hash, sha1($user->getEmailForVerification()))) {
            Log::warning('И-мэйл баталгаажуулах буруу холбоос.', ['id' => $id]); // log hiih

            return redirect($this->frontend('error')); // aldaa zaaana
        }

        // ali hediin verified baival redirect hiine
        if ($user->hasVerifiedEmail()) {
            return redirect($this->frontend('already')); // ali hediin ajilsang ni zaana
        }

        $user->markEmailAsVerified(); 

        // event uusgeh ba endees listener eer sonsono
        event(new Verified($user));

        Log::info('И-мэйл баталгаажлаа.', [
            'user_id' => $user->id,
            'email'   => $user->email,
        ]);

        // amjilttai bolsong damjuulah. 
        return redirect($this->frontend('success'));
    }

    /**
     * dahin link yvuulah function
     */
    public function resend(Request $request)
    {
        // tuhain email shaardlaga biyluulj baigaa eshiig ni shalgah
        $validated = $request->validate([
            'email' => 'required|string|email',
        ]);

        $user = User::where('email', $validated['email'])->first();

        // batalgaajaagui hereglegch oldvol mail yvuulah job ruu yvuulna.
        if ($user && ! $user->hasVerifiedEmail()) {
            try {
                SendVerifyEmailJob::dispatch($user); // queue ashiglahguin tuld dispatchSync();
            } catch (\Throwable $e) {
                // failed() doto log bichigdsen ba aldaanii hariu
                return response()->json(['message' => 'И-мэйл илгээхэд алдаа гарлаа.'], 500);
            }
        } else {
            // user baihgu esdvel hereglegch ali hediin verified baigaag ni iltgeh
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
