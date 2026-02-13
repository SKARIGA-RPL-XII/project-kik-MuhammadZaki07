<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use COM;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MenuController extends Controller
{
    /**
     * Display a listing of the resource.
     */
   public function index(Request $request)
    {
        $page = $request->query('page', 0);
        $size = $request->query('size', 10);

        $query = Menu::with('category', 'discount');

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('category')) {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('name', $request->category);
            });
        }

        if ($request->filled('stock_min')) {
            $query->where('stock', '>=', $request->stock_min);
        }

        if ($request->filled('stock_max')) {
            $query->where('stock', '<=', $request->stock_max);
        }

        $data = $query
            ->latest()
            ->skip($page * $size)
            ->take($size)
            ->get();

        return Controller::OKE(
            'success',
            'success get all data menu',
            ["menus" => $data, 'metadata' => [
                'page' => $page,
                'size' => $size,
                'total' => $data->count(),
            ]],
            200
        );
    }


    public function GetAllAdmin(Request $request)
    {
        $page = $request->query('page', 0);
        $size = $request->query('size', 10);

        $query = Menu::with('category', 'discount');

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('category')) {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('name', $request->category);
            });
        }

        if ($request->filled('stock_min')) {
            $query->where('stock', '>=', $request->stock_min);
        }

        if ($request->filled('stock_max')) {
            $query->where('stock', '<=', $request->stock_max);
        }

        $data = $query
            ->latest()
            ->skip($page * $size)
            ->take($size)
            ->get();

        return Controller::OKE(
            'success',
            'success get all data menu',
            ["menus" => $data, 'metadata' => [
                'page' => $page,
                'size' => $size,
                'total' => $data->count(),
            ]],
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
            "menu_image"  => "required|file|mimes:png,jpg,webp,jpeg|max:2040",
            "name" => "required|string|max:200",
            "category_id" => "exists:categories,id|required",
            "discount_id" => "exists:discounts,id",
            "description" => "string",
            "price" => "integer|min:0",
            "stock" => "integer|required|min:0",
            'is_active' => 'required|boolean'
        ]);

        $path = $request->file('menu_image')->store('menus', 'public');
        Menu::create([
            "menu_image"  => $path,
            "name" => $request->name,
            "category_id" => $request->category_id,
            "discount_id" => $request->discount_id,
            "description" => $request->description,
            "price" => $request->price,
            "stock" => $request->stock,
            "is_active" => boolval($request->is_active),
        ]);

        return Controller::OKE('success', 'succes create menu', [], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $data = Menu::with('category', 'discount')->findOrFail($id);
        return Controller::OKE('success', 'success get data by id', $data, 200);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Menu $menu) {}

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Menu $menu)
    {
        $validated = $request->validate([
            "menu_image"  => "sometimes|file|mimes:png,jpg,webp,jpeg|max:2040",
            "name" => "sometimes|string|max:200",
            "category_id" => "sometimes|exists:categories,id",
            "discount_id" => "sometimes|exists:discounts,id",
            "description" => "sometimes|string",
            "price" => "sometimes|integer|min:0",
            "stock" => "sometimes|integer|min:0",
            "is_active" => "sometimes|boolean"
        ]);

        if ($request->hasFile('menu_image')) {
            Storage::disk('public')->delete($menu->menu_image);
            $validated['menu_image'] = $request
                ->file('menu_image')
                ->store('menus', 'public');
        }

        $menu->update($validated);

        return Controller::OKE('success', 'success update menu', $menu, 200);
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Menu $menu)
    {
        Storage::disk('public')->delete($menu->menu_image);
        $menu->delete();
        return Controller::OKE('success', 'success delete', [], 200);
    }
}
