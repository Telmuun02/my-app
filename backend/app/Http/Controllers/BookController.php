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
        // join hiigeed avch bn.
        $query = Book::with(['category', 'authors']);

        // category filter hiih
        if ($request->filled('category') && $request->category !== 'all') {
            $name = $request->category;
            $query->whereHas('category', fn ($q) => $q->where('name', $name));
        }

        // search eer haih
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhereHas('authors', fn ($a) => $a->where('name', 'like', "%{$search}%"));
            });
        }

        // tuhain nom ni 0 ees ih huvi baina uu 
        if ($request->availability === 'available') {
            $query->where('available_copies', '>', 0);
        } elseif ($request->availability === 'checked-out') {
            $query->where('available_copies', '=', 0);
        }

        // Cache iin version hed deer bgg ni olno bhgu bol 1 
        $version = Cache::get('books.version', 1);

        // cache key uusgehed hereglegdeh ugugdluudiig
        $page         = $request->input('page', 1);
        $category     = $request->input('category', 'all');
        $search       = $request->input('search', '');
        $availability = $request->input('availability', '');
 
        $key = "books.v{$version}.{$category}.{$search}.{$availability}.page.{$page}";

        // cache deer key deer hadgalsan zuil bgaa esehiig ni olno bgaa bol cache aas butsaana
        // bhgu bol fn () => {} dotorhiig ajluulna
        $data = Cache::remember($key, 60, fn () => BookResource::collection($query->paginate(8))->response()->getData(true));

        return response()->json($data);
    }

    /**
     * Шинэ ном үүсгэх.  POST /api/books
     */
    public function store(Request $request)
    {   
        // tohiroh shaardlaguud
        $validated = $request->validate([
            'title'          => 'required|string|max:255',
            'isbn'           => 'required|string|unique:books',
            'category_id'    => 'required|exists:categories,id',
            'total_copies'   => 'required|integer|min:0',
            'author_ids'     => 'array',            // сонголтоор зохиолчдын id жагсаалт
            'author_ids.*'   => 'exists:authors,id',
        ]);

        // shineer ugugdul uusgeh 
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

        // cache iinha toog ni nemj daraagiin version uusgeh
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
        // shaardlaguud
        $validated = $request->validate([
            'title'        => 'sometimes|required|string|max:255',
            'isbn'         => 'sometimes|required|string|unique:books,isbn,' . $book->id,
            'category_id'  => 'sometimes|required|exists:categories,id',
            'total_copies' => 'sometimes|required|integer|min:0',
            'author_ids'   => 'array',
            'author_ids.*' => 'exists:authors,id',
        ]);

        $book->update($validated);

        if ($request->has('author_ids')) {
            $book->authors()->sync($validated['author_ids'] ?? []);
        }

        // buh huvilbariin toog negeer nemegduulne
        Cache::put('books.version', Cache::get('books.version', 1) + 1);

        return response()->json($book->load(['category', 'authors']));
    }

    /**
     * Ном устгах.  DELETE /api/books/{book}
     */
    public function destroy(Book $book)
    {
        $book->delete();

        // buh huvilbariin toog negeer nemegduulne
        Cache::put('books.version', Cache::get('books.version', 1) + 1);

        return response()->json(['message' => 'Ном устгагдлаа.']);
    }
}
