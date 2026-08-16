<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookResource extends JsonResource
{
    /**
     * Номын ЖАГСААЛТЫН API хариу — зөвхөн картад хэрэгтэй талбарууд.
     * Timestamps, isbn, id-нууд гэх мэт илүүдэл талбарыг гаргахгүй → payload багасна.
     *
     * Дэлгэрэнгүй хуудасны хариу нь BookDetailResource — тэнд isbn, нийт хувь
     * зэрэг нэмэлт талбар бий.
     */
    public function toArray(Request $request): array
    {
        return [
            'id'        => $this->id,
            'title'     => $this->title,
            'available' => $this->available_copies,
            'category'  => $this->category?->name,
            'company'   => $this->company?->name,
            'authors'   => $this->authors->pluck('name')->all(),
            'cover_url' => $this->coverUrl(),
        ];
    }
}
