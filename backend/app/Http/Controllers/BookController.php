<?php

namespace App\Http\Controllers;

use App\Http\Resources\BookDetailResource;
use App\Http\Resources\BookResource;
use App\Models\Book;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\ValidationException;

/**
 * Номын CRUD үйлдлүүд.
 *
 * Жагсаалтын хариу нь кэшлэгддэг. Кэшийг устгахын оронд "хувилбарын дугаар"
 * ашигладаг: өгөгдөл өөрчлөгдөх бүрд books.version нэмэгдэж, өмнөх бүх түлхүүр
 * автоматаар хүчингүй болдог. Ингэснээр шүүлтүүрийн бүх хослолын түлхүүрийг
 * нэг бүрчлэн олж устгах шаардлагагүй.
 */
class BookController extends Controller
{
    /**
     * Номын жагсаалт — шүүлтүүр, хайлт, хуудаслалттай.  GET /api/books
     
     */
    public function index(Request $request): JsonResponse
    {
        // Ангилал, зохиолч, компанийг урьдчилан ачаалж N+1 асуулгаас сэргийлнэ.
        $query = Book::with(['category', 'authors', 'company']);

        // --- Компаниар тусгаарлах ---
        // Хэрэглэгч зөвхөн өөрийн компанийн номыг харна. Админ бүгдийг.
        $user = $request->user();
        $scope = 'all';

        if ($user->role !== 'admin') {
            $query->where('company_id', $user->company_id);
            $scope = "c{$user->company_id}";
        }

        // 'all' нь "шүүхгүй" гэсэн утгатай тул хоосонтой адилтган алгасна.
        if ($request->filled('category') && $request->category !== 'all') {
            $name = $request->category;
            $query->whereHas('category', fn ($q) => $q->where('name', $name));
        }

        // Хайлт нь номын гарчиг БОЛОН зохиолчийн нэр хоёуланг хамарна. Хаалтанд
        // бүлэглэсний учир нь дээрх шүүлтүүртэй OR-оор холилдохоос сэргийлэх.
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhereHas('authors', fn ($a) => $a->where('name', 'like', "%{$search}%"));
            });
        }

        if ($request->availability === 'available') {
            $query->where('available_copies', '>', 0);
        } elseif ($request->availability === 'checked-out') {
            $query->where('available_copies', '=', 0);
        }

        // Кэшийн одоогийн хувилбар. Ном өөрчлөгдөхөд энэ тоо нэмэгддэг тул
        // хуучин хувилбарын түлхүүрүүд дахин хэзээ ч уншигдахгүй.
        $version = Cache::get('books.version', 1);

        // Түлхүүрт шүүлтүүрийн бүх утгыг оруулна — өөр шүүлтүүрийн үр дүн
        // хоорондоо холилдохгүй байх ёстой.
        $page         = $request->input('page', 1);
        $category     = $request->input('category', 'all');
        $search       = $request->input('search', '');
        $availability = $request->input('availability', '');

        // $scope ЗААВАЛ түлхүүрт орно. Үгүй бол Company 15-ын хэрэглэгчийн
        // хүсэлтээр кэшлэгдсэн хариу Company 16-ын хэрэглэгчид буцаж,
        // өөр компанийн номууд харагдана — алдаа ч заахгүй, зүгээр л
        // буруу өгөгдөл. Кэшийн түлхүүрт шүүлтийн БҮХ хэмжигдэхүүн орох ёстой.
        $key = "books.v{$version}.{$scope}.{$category}.{$search}.{$availability}.page.{$page}";

        // Кэшэд байвал шууд буцаана, үгүй бол closure-ыг ажиллуулж 60 секунд хадгална.
        $data = Cache::remember($key, 60, fn () => BookResource::collection($query->paginate(8))->response()->getData(true));

        return response()->json($data);
    }

    /**
     * Шинэ ном үүсгэх.  POST /api/books
     *
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'          => 'required|string|max:255',
            'isbn'           => 'required|string|unique:books',
            'category_id'    => 'required|exists:categories,id',
            'total_copies'   => 'required|integer|min:0',
            'author_ids'     => 'array',            // сонголтоор зохиолчдын id жагсаалт
            'author_ids.*'   => 'exists:authors,id',
        ]);

        // Шинэ номын бүх хувь эхэндээ боломжтой байна.
        $book = Book::create([
            'title'            => $validated['title'],
            'isbn'             => $validated['isbn'],
            'category_id'      => $validated['category_id'],
            'total_copies'     => $validated['total_copies'],
            'available_copies' => $validated['total_copies'],
        ]);

        // Ном↔зохиолч нь олон-олон холбоо тул pivot хүснэгтээр холбоно.
        if (! empty($validated['author_ids'])) {
            $book->authors()->attach($validated['author_ids']);
        }

        // Жагсаалтын кэшийг хүчингүй болгоно: хувилбар нэмэгдэхэд index()-ийн
        // үүсгэдэг түлхүүр өөрчлөгдөж, хуучин бичлэгүүд уншигдахаа болино.
        Cache::put('books.version', Cache::get('books.version', 1) + 1);

        return response()->json($book->load(['category', 'authors']), 201);
    }

    /**
     * Нэг номын дэлгэрэнгүй.  GET /api/books/{book}
     *
     * Resource ашигласан нь чухал: index() ч мөн resource буцаадаг тул нэг
     * entity хоёр өөр хэлбэртэй байхаас сэргийлнэ. Мөн cover_url энд ирнэ.
     */
    public function show(Request $request, Book $book): JsonResponse
    {
        // Жагсаалтыг шүүх нь ХАНГАЛТГҮЙ. Хэрэглэгч /api/books/42 гэж шууд
        // дуудвал жагсаалтад харагдаагүй ном руу ч хандаж чадна (IDOR).
        // Тиймээс нэг бүрчлэн авах үед ч эрхийг шалгана.
        $user = $request->user();

        if ($user->role !== 'admin' && $book->company_id !== $user->company_id) {
            return response()->json([
                'message' => 'Энэ ном таны компанид харьяалагдахгүй байна.',
            ], 403);
        }

        $book->load(['category', 'authors', 'company']);

        return response()->json(new BookDetailResource($book));
    }

    /**
     * Ном засварлах.  PUT /api/books/{book}
     *
     */
    public function update(Request $request, Book $book): JsonResponse
    {
        // 'sometimes' — талбар ирээгүй бол шалгахгүй өнгөрнө. Ингэснээр хэсэгчилсэн
        // засвар хийх боломжтой. unique дүрэмд одоогийн id-г оруулсан нь өөрийнх
        // нь ISBN-ийг "давхардсан" гэж үзэхээс сэргийлэх зорилготой.
        $validated = $request->validate([
            'title'        => 'sometimes|required|string|max:255',
            'isbn'         => 'sometimes|required|string|unique:books,isbn,' . $book->id,
            'category_id'  => 'sometimes|required|exists:categories,id',
            'total_copies' => 'sometimes|required|integer|min:0',
            'author_ids'   => 'array',
            'author_ids.*' => 'exists:authors,id',
        ]);

        $book->update($validated);

        // has() ашигласан нь чухал: author_ids хоосон массиваар ирвэл "бүх зохиолчийг
        // салга" гэсэн санаатай үйлдэл тул sync() дуудагдах ёстой.
        if ($request->has('author_ids')) {
            $book->authors()->sync($validated['author_ids'] ?? []);
        }

        // Өгөгдөл өөрчлөгдсөн тул жагсаалтын кэшийн хувилбарыг ахиулна.
        Cache::put('books.version', Cache::get('books.version', 1) + 1);

        return response()->json($book->load(['category', 'authors']));
    }

    /**
     * Ном устгах.  DELETE /api/books/{book}
     */
    public function destroy(Book $book): JsonResponse
    {
        $book->delete();

        // Өгөгдөл өөрчлөгдсөн тул жагсаалтын кэшийн хувилбарыг ахиулна.
        Cache::put('books.version', Cache::get('books.version', 1) + 1);

        return response()->json(['message' => 'Ном устгагдлаа.']);
    }
}
