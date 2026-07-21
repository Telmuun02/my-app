<?php

namespace App\Http\Controllers;

use App\Models\Book;
use Illuminate\Http\Request;

class BookController extends Controller
{
    /**
     * Бүх номыг (ангилал, зохиолчтой нь) жагсаах.  GET /api/books
     */
    public function index()
    {
        // with(...) → N+1 query-гээс сэргийлж холбоотой өгөгдлийг зэрэг ачаална
        return response()->json(Book::with(['category', 'authors'])->get());
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

        return response()->json($book->load(['category', 'authors']));
    }

    /**
     * Ном устгах.  DELETE /api/books/{book}
     */
    public function destroy(Book $book)
    {
        $book->delete();

        return response()->json(['message' => 'Ном устгагдлаа.']);
    }
}
