<?php

namespace App\Http\Controllers;

use App\Http\Resources\BookResource;
use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class BookController extends Controller
{
    /**
     * Бүх номыг (ангилал, зохиолчтой нь) жагсаах.  GET /api/books
     */
    public function index(Request $request)
    {
        $query = Book::with(['category', 'authors']);

        // Server-side шүүлт — pagination-той өв ажиллахын тулд шүүлтийг server дээр хийнэ.
        if ($request->filled('category') && $request->category !== 'all') {
            $name = $request->category;
            $query->whereHas('category', fn ($q) => $q->where('name', $name));
        }

        if ($request->filled('search')) {
            $search = $request->search;
            // Гарчиг ЭСВЭЛ зохиолчийн нэрээр хайна
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

        // --- Cache ---
        // Жагсаалтын "хувилбар" дугаар. Ном өөрчлөгдөх бүрд нэмэгдэж, бүх хуучин key-г
        // автоматаар хүчингүй болгоно (доорх store/update/destroy-г үз).
        $version = Cache::get('books.version', 1);

        // Шүүлтийн параметр бүрийг key-д оруулна — параметр өөр байх бүрт өөр cache үүснэ.
        $page         = $request->input('page', 1);
        $category     = $request->input('category', 'all');
        $search       = $request->input('search', '');
        $availability = $request->input('availability', '');

        $key = "books.v{$version}.{$category}.{$search}.{$availability}.page.{$page}";

        // Cache-д байвал DB-д ороохгүй шууд буцаана; байхгүй бол query-г ажиллуулж 60 сек хадгална.
        $books = Cache::remember($key, 60, fn () => $query->paginate(8));

        return BookResource::collection($books);
    }

    /**
     * Шинэ ном үүсгэх.  POST /api/books
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'          => 'required|string|max:255',
            'isbn'           => 'required|string|unique:books',
            'category_id'    => 'required|exists:categories,id',
            'total_copies'   => 'required|integer|min:0',
            'author_ids'     => 'array',            // сонголтоор зохиолчдын id жагсаалт
            'author_ids.*'   => 'exists:authors,id',
        ]);

        // Эхэндээ авах боломжтой хувь = нийт хувь
        $book = Book::create([
            'title'            => $validated['title'],
            'isbn'             => $validated['isbn'],
            'category_id'      => $validated['category_id'],
            'total_copies'     => $validated['total_copies'],
            'available_copies' => $validated['total_copies'],
        ]);

        // Зохиолчид ирсэн бол pivot-д холбоно
        if (! empty($validated['author_ids'])) {
            $book->authors()->attach($validated['author_ids']);
        }

        // Жагсаалт өөрчлөгдсөн → version нэмж, бүх хуучин cache-г хүчингүй болгоно
        Cache::put('books.version', Cache::get('books.version', 1) + 1);

        return response()->json($book->load(['category', 'authors']), 201);
    }

    /**
     * Нэг номыг харах.  GET /api/books/{book}
     */
    public function show(Book $book)
    {
        return response()->json($book->load(['category', 'authors']));
    }

    /**
     * Ном засах.  PUT /api/books/{book}
     */
    public function update(Request $request, Book $book)
    {
        $validated = $request->validate([
            'title'        => 'sometimes|required|string|max:255',
            'isbn'         => 'sometimes|required|string|unique:books,isbn,' . $book->id,
            'category_id'  => 'sometimes|required|exists:categories,id',
            'total_copies' => 'sometimes|required|integer|min:0',
            'author_ids'   => 'array',
            'author_ids.*' => 'exists:authors,id',
        ]);

        $book->update($validated);

        // Зохиолчдын жагсаалт ирсэн бол шинэчилнэ (sync = хуучныг сольж шинээр тавина)
        if ($request->has('author_ids')) {
            $book->authors()->sync($validated['author_ids'] ?? []);
        }

        // Жагсаалт өөрчлөгдсөн → version нэмж, бүх хуучин cache-г хүчингүй болгоно
        Cache::put('books.version', Cache::get('books.version', 1) + 1);

        return response()->json($book->load(['category', 'authors']));
    }

    /**
     * Ном устгах.  DELETE /api/books/{book}
     */
    public function destroy(Book $book)
    {
        $book->delete();

        // Жагсаалт өөрчлөгдсөн → version нэмж, бүх хуучин cache-г хүчингүй болгоно
        Cache::put('books.version', Cache::get('books.version', 1) + 1);

        return response()->json(['message' => 'Ном устгагдлаа.']);
    }
}
