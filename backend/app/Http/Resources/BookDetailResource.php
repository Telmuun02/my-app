<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Нэг номын ДЭЛГЭРЭНГҮЙ хариу — GET /api/books/{book}
 *
 * Өмнө нь show() нь Eloquent загварыг шууд буцаадаг байсан. Тиймээс нэг л
 * entity хоёр өөр хэлбэртэй байв:
 *   index → { available, category: "Fiction", authors: ["A"], cover_url }
 *   show  → { available_copies, category: {...}, authors: [{...}], (cover_url БАЙХГҮЙ) }
 *
 * Үүний улмаас frontend дээр нэмэлт хөрвүүлэлт бичих шаардлага үүсч, дэлгэрэнгүй
 * хуудсанд номын зураг огт ирдэггүй байсан. Одоо хоёулаа ижил нэршилтэй —
 * дэлгэрэнгүй нь зөвхөн НЭМЭЛТ талбартай (isbn, total).
 */
class BookDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'        => $this->id,
            'title'     => $this->title,
            'isbn'      => $this->isbn,
            'available' => $this->available_copies,
            'total'     => $this->total_copies,
            'category'  => $this->category?->name,
            'authors'   => $this->authors->pluck('name')->all(),
            'cover_url' => $this->coverUrl(),
        ];
    }
}
