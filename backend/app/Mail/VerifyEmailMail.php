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
 * email zahidalaa bichiv
 *
 * Mailable ashiglasan 
 */
class VerifyEmailMail extends Mailable
{
    use Queueable, SerializesModels;

    // baiguulagch 
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

    // aguulga hesgiig ni bichiv
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
     * link nii baih hugatsaa
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
