<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/**
 * Номын ангиллын delete, update, create, select үйлдлүүд.
 *
 * Жагсаах, харах нь нээлттэй; үүсгэх, засах, устгах нь нэвтэрсэн бөгөөд
 * и-мэйлээ баталгаажуулсан хэрэглэгчид зориулагдсан (routes/api.php-г үзнэ үү).
 */
class CategoryController extends Controller
{
    /**
     * Бүх ангилал.
     */
    public function index(): JsonResponse
    {
        return response()->json(Category::all());
    }

    /**
     * Шинэ ангилал үүсгэх.  POST /api/categories
     *
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories',
        ]);

        $category = Category::create($validated);

        return response()->json($category, 201);
    }

    /**
     * Нэг ангилал, түүнд харьяалагдах номуудын хамт.  GET /api/categories/{category}
     */
    public function show(Category $category): JsonResponse
    {
        return response()->json($category->load('books'));
    }

    /**
     * Ангилал засварлах.  PUT /api/categories/{category}
     *
     */
    public function update(Request $request, Category $category): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,' . $category->id,
        ]);

        $category->update($validated);

        return response()->json($category);
    }

    /**
     * Ангилал устгах.  DELETE /api/categories/{category}
     */
    public function destroy(Category $category): JsonResponse
    {
        $category->delete();

        return response()->json(['message' => 'Ангилал устгагдлаа.']);
    }
}
