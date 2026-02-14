<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use App\Models\Attribute;
use App\Models\AttributeLevel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class MenuController extends Controller
{

    public function index(Request $request)
    {

        $page = max(0, (int) $request->query('page', 0));
        $size = max(1, (int) $request->query('size', 10));

        $query = Menu::with([
            'category',
            'discount',
            'attributes.levels'
        ]);

        if ($request->filled('search')) {

            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('category')) {

            $query->where('category_id', $request->category);
        }

        if ($request->filled('stock_min')) {

            $query->where('stock', '>=', $request->stock_min);
        }

        if ($request->filled('stock_max')) {

            $query->where('stock', '<=', $request->stock_max);
        }

        $total = $query->count();

        $data = $query
            ->where("is_active", true)
            ->latest()
            ->skip($page * $size)
            ->take($size)
            ->get();

        return Controller::OKE(
            'success',
            'success get menus',
            [
                "menus" => $data,
                "metadata" => [
                    "page" => $page,
                    "size" => $size,
                    "total" => $total
                ]
            ],
            200
        );
    }

  public function getALlAdmin(Request $request)
    {

        $page = max(0, (int) $request->query('page', 0));
        $size = max(1, (int) $request->query('size', 10));

        $query = Menu::with([
            'category',
            'discount',
            'attributes.levels'
        ]);

        if ($request->filled('search')) {

            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('category')) {

            $query->where('category_id', $request->category);
        }

        if ($request->filled('stock_min')) {

            $query->where('stock', '>=', $request->stock_min);
        }

        if ($request->filled('stock_max')) {

            $query->where('stock', '<=', $request->stock_max);
        }

        $total = $query->count();

        $data = $query
            ->latest()
            ->skip($page * $size)
            ->take($size)
            ->get();

        return Controller::OKE(
            'success',
            'success get menus',
            [
                "menus" => $data,
                "metadata" => [
                    "page" => $page,
                    "size" => $size,
                    "total" => $total
                ]
            ],
            200
        );
    }

    public function store(Request $request)
    {

        $validated = $request->validate([
            "menu_image" => "required|file|mimes:jpg,jpeg,png,webp|max:2040",
            "name" => "required|string|max:200",
            "category_id" => "required|exists:categories,id",
            "discount_id" => "nullable|exists:discounts,id",
            "description" => "nullable|string",
            "price" => "nullable|integer|min:0",
            "stock" => "required|integer|min:1",
            "is_active" => "required|boolean",
            "attributes" => "nullable|array",
            "attributes.*" => "array",
            "attributes.*.*" => "exists:attribute_levels,id"

        ]);


        return DB::transaction(function () use ($request, $validated) {

            $path = $request->file('menu_image')
                ->store('menus', 'public');


            $menu = Menu::create([
                "menu_image" => $path,
                "name" => $validated['name'],
                "category_id" => $validated['category_id'],
                "discount_id" => $validated['discount_id'] ?? null,
                "description" => $validated['description'] ?? null,
                "price" => $validated['price'] ?? 0,
                "stock" => $validated['stock'],
                "is_active" => $validated['is_active']
            ]);


            if (!empty($validated['attributes'])) {

                $syncData = [];

                foreach ($validated['attributes'] as $attrId => $levelIds) {

                    $attribute = Attribute::find($attrId);

                    if (!$attribute) continue;

                    foreach (array_unique($levelIds) as $levelId) {

                        $level = AttributeLevel::where('id', $levelId)
                            ->where('attribute_id', $attrId)
                            ->first();

                        if (!$level) continue;

                        $syncData[] = [

                            'menu_id' => $menu->id,

                            'attribute_id' => $attrId,

                            'attribute_level_id' => $levelId,

                            'created_at' => now(),

                            'updated_at' => now()

                        ];
                    }
                }

                DB::table('menu_attributes')
                    ->insert($syncData);
            }


            return Controller::OKE(
                'success',
                'success create menu',
                $menu,
                201
            );
        });
    }



    public function show($id)
    {

        $menu = Menu::with([
            'category',
            'discount',
            'attributes.levels'
        ])
            ->findOrFail($id);


        return Controller::OKE(
            'success',
            'success get menu',
            $menu,
            200
        );
    }



    public function update(Request $request, Menu $menu)
    {

        $validated = $request->validate([

            "menu_image" => "sometimes|file|mimes:jpg,jpeg,png,webp|max:2040",

            "name" => "sometimes|string|max:200",

            "category_id" => "sometimes|exists:categories,id",

            "discount_id" => "nullable|exists:discounts,id",

            "description" => "nullable|string",

            "price" => "nullable|integer|min:0",

            "stock" => "sometimes|integer|min:0",

            "is_active" => "sometimes|boolean",

            "attributes" => "nullable|array",

            "attributes.*" => "array",

            "attributes.*.*" => "exists:attribute_levels,id"

        ]);


        return DB::transaction(function () use ($request, $menu, $validated) {


            if ($request->hasFile('menu_image')) {

                Storage::disk('public')
                    ->delete($menu->menu_image);

                $validated['menu_image'] =
                    $request->file('menu_image')
                    ->store('menus', 'public');
            }


            $menu->update($validated);


            if (array_key_exists('attributes', $validated)) {

                DB::table('menu_attributes')
                    ->where('menu_id', $menu->id)
                    ->delete();


                $syncData = [];

                foreach ($validated['attributes'] as $attrId => $levelIds) {

                    $attribute = Attribute::find($attrId);

                    if (!$attribute) continue;

                    foreach (array_unique($levelIds) as $levelId) {

                        $level = AttributeLevel::where('id', $levelId)
                            ->where('attribute_id', $attrId)
                            ->first();

                        if (!$level) continue;

                        $syncData[] = [

                            'menu_id' => $menu->id,

                            'attribute_id' => $attrId,

                            'attribute_level_id' => $levelId,

                            'created_at' => now(),

                            'updated_at' => now()

                        ];
                    }
                }

                if (!empty($syncData)) {

                    DB::table('menu_attributes')
                        ->insert($syncData);
                }
            }


            return Controller::OKE(
                'success',
                'success update menu',
                $menu,
                200
            );
        });
    }



    public function destroy(Menu $menu)
    {

        DB::transaction(function () use ($menu) {

            Storage::disk('public')
                ->delete($menu->menu_image);

            DB::table('menu_attributes')
                ->where('menu_id', $menu->id)
                ->delete();

            $menu->delete();
        });


        return Controller::OKE(
            'success',
            'success delete menu',
            [],
            200
        );
    }
}
