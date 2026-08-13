<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'isbn',
        'category_id',
        'company_id',
        'total_copies',
        'available_copies',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id', 'id');
    }

    public function authors()
    {
        return $this->belongsToMany(Author::class, 'author_book', 'book_id', 'author_id');
    }

    public function loans()
    {
        return $this->hasMany(Loan::class, 'book_id', 'id');
    }

    /**
     * Cloudinary дээрх нүүр зургийн хүргэлтийн URL.
     *
     * Өмнө нь энэ логик BookResource дотор байсан. Загвар руу зөөсөн шалтгаан:
     * одоо BookResource, BookDetailResource хоёулаа үүнийг дуудна — хоёр
     * газар давхардуулан бичихийн оронд нэг эх сурвалжтай байх нь зөв.
     *
     * Одоогоор бүх ном ижил зураг ашиглана. Ном тус бүрийн хавтас нэмэх үед
     * зөвхөн энэ методын дотор public_id-г сольвол хангалттай.
     *
     * URL доторх хувиргалтууд Cloudinary тал дээр ажиллана:
     *   w_400,h_560  — дэлгэрэнгүй хуудсын том хавтсанд хүрэлцэхүйц
     *   c_fill       — харьцааг хадгалж, хүрээг дүүргэж таслана
     *   f_auto       — хөтөч дэмждэг бол WebP/AVIF болгож хөнгөлнө
     *   q_auto       — чанарыг автоматаар тохируулж хэмжээг багасгана
     */
    public function coverUrl(): string
    {
        $cloud    = config('services.cloudinary.cloud_name');
        $publicId = config('services.cloudinary.default_cover');

        return "https://res.cloudinary.com/{$cloud}/image/upload"
            . '/w_400,h_560,c_fill,f_auto,q_auto'
            . "/{$publicId}";
    }
}
