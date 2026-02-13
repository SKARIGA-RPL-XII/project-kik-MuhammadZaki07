<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $size = (int) $request->query('size', 10);
        $page = (int) $request->query('page', 0);
        $search = $request->query('search', '');

        $query = Category::query();

        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        $total = $query->count();

        $data = $query->latest()
            ->skip($page * $size)
            ->take($size)
            ->get();

        return Controller::OKE(
            'status',
            'success get data',
            [
                "category" => $data,
                "metadata" => [
                    "page" => $page,
                    "size" => $size,
                    "total" => $total
                ]
            ],
            200
        );
    }


    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            "name" => "required|string",
        ]);


        Category::create([
            "name" => $request->name,
            "slug" => Str::slug($request->name)
        ]);

        return Controller::OKE('success', 'success create category', 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Category $category)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Category $category)
    {
        $request->validate([
            "name" => "string|sometimes",
            "is_active" => "sometimes|boolean",
        ]);

        $category->update([
            "name" => $request->name,
            "slug" => Str::slug($request->name),
            "is_active" => boolval($request->is_active),
        ]);

        return Controller::OKE('success', 'Success update category', 200);
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        $category->delete();
        return Controller::OKE('success', 'success delete', 200);
    }
}
