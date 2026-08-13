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
            'cover_url' => $this->coverUrl(),
        ];
    }

    /**
     * Cloudinary дээрх нүүр зургийн хүргэлтийн URL.
     *
     * Одоогоор бүх ном ижил зураг ашиглана. Ном тус бүрийн хавтас нэмэх үед
     * зөвхөн энэ методын дотор public_id-г сольвол хангалттай.
     *
     * URL доторх хувиргалтууд Cloudinary тал дээр ажиллана:
     *   w_180,h_260  — картын 90×130 хэмжээнээс 2 дахин том (retina дэлгэцэд тод)
     *   c_fill       — харьцааг хадгалж, хүрээг дүүргэж таслана
     *   f_auto       — хөтөч дэмждэг бол WebP/AVIF болгож хөнгөлнө
     *   q_auto       — чанарыг автоматаар тохируулж хэмжээг багасгана
     */
    protected function coverUrl(): string
    {
        $cloud    = config('services.cloudinary.cloud_name');
        $publicId = config('services.cloudinary.default_cover');

        return "https://res.cloudinary.com/{$cloud}/image/upload"
            . '/w_180,h_260,c_fill,f_auto,q_auto'
            . "/{$publicId}";
    }
}
