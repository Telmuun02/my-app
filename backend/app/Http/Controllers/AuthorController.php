<?php

namespace App\Http\Controllers;

use App\Models\Author;
use Illuminate\Http\Request;

class AuthorController extends Controller
{
    // list butsaah function
    public function index()
    {
        return response()->json(Author::all());
    }

    // store buyu create hiih
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $author = Author::create($validated);

        return response()->json($author, 201);
    }
    
    // select hiih
    public function show(Author $author)
    {
        return response()->json($author->load('books'));
    }

    // update hiih
    public function update(Request $request, Author $author)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $author->update($validated);

        return response()->json($author);
    }

    // delete hiih
    public function destroy(Author $author) 
    {
        $author->delete();

        return response()->json(['message' => 'Зохиолч устгагдлаа.']);
    }
}
