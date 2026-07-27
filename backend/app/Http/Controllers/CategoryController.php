<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        // 1. paginate - хуудаслалттай хийх 
        // limit - 100
        // page - 2
        // 2. seeder + factory - 100 ангилал үүсгэх || 
        // Facade => software design pattern || architecture
        // unique => үүсэхэд Log бичдэг болгох || INFO, ERROR, WARNING, DEBUG, TRACE
        return response()->json(Category::all());
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories',
        ]);

        $category = Category::create($validated);

        return response()->json($category, 201);
    }


    public function show(Category $category)
    {
        return response()->json($category->load('books'));
    }


    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,' . $category->id,
        ]);

        $category->update($validated);

        return response()->json($category);
    }


    public function destroy(Category $category)
    {
        $category->delete();

        return response()->json(['message' => 'Ангилал устгагдлаа.']);
    }
}
