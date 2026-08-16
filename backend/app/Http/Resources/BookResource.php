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
            // Харьцаануудыг зөвхөн нэрээр нь (объект биш) — хамгийн бага өгөгдөл
            'category'  => $this->category?->name,
            // Аль компанийн ном болохыг картан дээр харуулна
            'company'   => $this->company?->name,
            // ->all() → Collection-ыг plain массив болгоно (cache-д зөв serialize болно)
            'authors'   => $this->authors->pluck('name')->all(),
            // URL үүсгэх логик Book загвар дээр — BookDetailResource ч мөн адил дуудна
            'cover_url' => $this->coverUrl(),
        ];
    }
}
