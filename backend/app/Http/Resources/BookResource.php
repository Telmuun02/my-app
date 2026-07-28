<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookResource extends JsonResource
{
    /**
     * Номын API хариуг зөвхөн UI-д хэрэгтэй талбараар бүрдүүлнэ.
     * Timestamps, isbn, id-нууд гэх мэт илүүдэл талбарыг гаргахгүй → payload багасна.
     */
    public function toArray(Request $request): array
    {
        return [
            'id'        => $this->id,
            'title'     => $this->title,
            'available' => $this->available_copies,
            // Харьцаануудыг зөвхөн нэрээр нь (объект биш) — хамгийн бага өгөгдөл
            'category'  => $this->category?->name,
            // ->all() → Collection-ыг plain массив болгоно (cache-д зөв serialize болно)
            'authors'   => $this->authors->pluck('name')->all(),
        ];
    }
}
