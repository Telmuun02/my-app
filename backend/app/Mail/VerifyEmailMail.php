<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\URL;

/**
 * Бүртгүүлсэн хэрэглэгч рүү явах и-мэйл баталгаажуулах захидал.
 *
 * Notification биш Mailable ашиглаж байгаа тул баталгаажуулах signed URL-ыг
 * Laravel биднийн өмнөөс үүсгэхгүй — доор гараар үүсгэж байна.
 */
class VerifyEmailMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public User $user)
    {
        //
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'И-мэйл хаягаа баталгаажуулна уу',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.verify-email',
            with: [
                'url'         => $this->verificationUrl(),
                'expireHours' => (int) round(config('auth.verification.expire', 60) / 60),
            ],
        );
    }

    /**
     * Хугацаатай + гарын үсэгтэй (signed) баталгаажуулах холбоос.
     *
     * - expires  → тогтоосон хугацааны дараа холбоос хүчингүй болно
     * - signature→ URL-ийн аль ч хэсгийг өөрчилвөл гарын үсэг таарахгүй
     * - sha1(email) → холбоосыг тухайн үеийн и-мэйл хаягтай холбоно, тул
     *   хэрэглэгч и-мэйлээ солибол хуучин холбоос автоматаар хүчингүй болно
     */
    protected function verificationUrl(): string
    {
        return URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(config('auth.verification.expire', 60)),
            [
                'id'   => $this->user->getKey(),
                'hash' => sha1($this->user->getEmailForVerification()),
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
