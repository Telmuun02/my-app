<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Зээллэгийн API хариу.
 *
 * Өмнө нь index() нь Eloquent загварыг шууд буцаадаг байсан. Тэр нь:
 *   - timestamps, user_id, book_id зэрэг UI-д хэрэггүй талбарыг дагуулна
 *   - $loan->user бүхэлдээ явна — И-МЭЙЛ хаяг ч мөн адил. Хэрэглэгч өөрийнхөө
 *     мэйлийг харах нь асуудалгүй ч, админ жагсаалт татахад бүх хэрэглэгчийн
 *     мэйл нэг хүсэлтээр гарна. Хэрэгцээгүй өгөгдөл бол эрсдэл.
 *
 * Тиймээс энд зөвхөн дэлгэцэнд хэрэгтэйг нь гаргана.
 */
class LoanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'loan_date'   => $this->loan_date,
            'due_date'    => $this->due_date,
            'return_date' => $this->return_date,
            'returned'    => $this->return_date !== null,
            'book'        => $this->whenLoaded('book', fn () => [
                'id'        => $this->book->id,
                'title'     => $this->book->title,
                'cover_url' => $this->book->coverUrl(),
            ]),
            'user'        => $this->whenLoaded('user', fn () => [
                'id'   => $this->user->id,
                'name' => $this->user->name,
            ]),
        ];
    }
}
