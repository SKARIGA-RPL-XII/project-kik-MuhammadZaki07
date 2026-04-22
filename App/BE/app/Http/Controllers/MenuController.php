<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use App\Models\User;
use App\Events\MenuDiscountCreated;
use App\Events\MenuDiscountUpdate;
use App\Models\Stock;
use App\Models\Unit;
use App\Notifications\GeneralNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Notification;
use Intervention\Image\Laravel\Facades\Image;

class MenuController extends Controller
{
    /**
     * Get menus for Customer with optimization
     */
    public function index(Request $request)
    {
        $size = $request->query('size', 12);

        $bestSellerIds = cache()->remember('best_seller_ids', 3600, function () {
            return DB::table('transaction_details')
                ->select('menu_id', DB::raw('SUM(menu_qty) as total_sold'))
                ->groupBy('menu_id')
                ->orderByDesc('total_sold')
                ->take(5)
                ->pluck('menu_id')
                ->toArray();
        });

        $query = Menu::with([
            'category:id,name,slug',
            'discount',
            'attributes.levels',
            'stocks'
        ])->where("is_active", true);

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('category')) {
            $cat = $request->category;
            $query->where(function ($q) use ($cat) {
                $q->where('category_id', $cat)
                    ->orWhereHas('category', fn($q2) => $q2->where('slug', $cat));
            });
        }

        $this->applySorting($query, $request->sort_by, $bestSellerIds);
        $menus = $query->paginate($size);

        $menus->getCollection()->transform(function ($menu) use ($bestSellerIds) {
            $menu->is_best_seller = in_array($menu->id, $bestSellerIds);
            return $menu;
        });

        return Controller::OKE('success', 'success get menus', [
            "menus" => $menus->items(),
            "metadata" => [
                "page" => $menus->currentPage(),
                "size" => (int) $menus->perPage(),
                "total" => $menus->total(),
                "last_page" => $menus->lastPage()
            ]
        ], 200);
    }

    /**
     * Get menus for Admin
     */
    public function getALlAdmin(Request $request)
    {
        $size = $request->query('size', 10);

        $query = Menu::with(['category', 'discount', 'attributes.levels', 'stocks']);

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('category')) {
            $query->where('category_id', $request->category);
        }

        $menus = $query->latest()->paginate($size);

        return Controller::OKE('success', 'success get menus admin', [
            "menus" => $menus->items(),
            "metadata" => [
                "page" => $menus->currentPage(),
                "size" => (int) $menus->perPage(),
                "total" => $menus->total(),
                "last_page" => $menus->lastPage()
            ]
        ], 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            "menu_image" => "required|file|mimes:jpg,jpeg,png,webp|max:2040",
            "name" => "required|string|max:200",
            "category_id" => "required|exists:categories,id",
            "discount_id" => "nullable",
            "description" => "nullable|string",
            "price" => "required|integer|min:0",
            "is_active" => "required|boolean",
            "attributes" => "nullable|array",
            "attributes.*.attribute_id" => "required|exists:attributes,id",
            "attributes.*.levels" => "required|array",
            "attributes.*.levels.*.attribute_level_id" => "required|exists:attribute_levels,id",
            "attributes.*.levels.*.price" => "nullable|numeric",
            "stocks" => "required|array|min:1",
            "stocks.*.stock_id" => "required|exists:stocks,id",
            "stocks.*.amount" => "required|numeric|min:0.01",
            "stocks.*.unit_id" => "required|exists:units,id",
            "level_stocks" => "nullable|array",
            "level_stocks.*.level_id" => "required|exists:attribute_levels,id",
            "level_stocks.*.stock_id" => "required|exists:stocks,id",
            "level_stocks.*.unit_id" => "required|exists:units,id",
            "level_stocks.*.amount" => "required|numeric|min:0",
        ]);

        return DB::transaction(function () use ($request, $validated) {
            $path = $this->handleUpload($request->file('menu_image'));

            $menu = Menu::create(array_merge($validated, ["menu_image" => $path]));
            foreach ($validated['stocks'] as $stockItem) {
                $menu->stocks()->attach($stockItem['stock_id'], [
                    'amount' => $stockItem['amount'],
                    'unit_id' => $stockItem['unit_id'],
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }

            if (!empty($validated['attributes'])) {
                foreach ($validated['attributes'] as $attr) {
                    foreach ($attr['levels'] as $level) {
                        $menu->attributeLevels()->attach($level['attribute_level_id'], [
                            'price' => $level['price'] ?? 0
                        ]);
                    }
                }
            }

            if (!empty($validated['level_stocks'])) {
                foreach ($validated['level_stocks'] as $ls) {
                    DB::table('attribute_level_stocks')->insert([
                        'attribute_level_id' => $ls['level_id'],
                        'stock_id'           => $ls['stock_id'],
                        'unit_id'            => $ls['unit_id'],
                        'amount'             => $ls['amount'],
                        'created_at'         => now(),
                        'updated_at'         => now()
                    ]);
                }
            }

            return Controller::OKE('success', 'success create menu', $menu->load(['stocks']), 201);
        });
    }

    public function show($id)
    {
        $menu = Menu::with([
            'category',
            'discount',
            'stocks',
            'attributes.levels' => function ($query) use ($id) {
                $query->wherePivot('menu_id', $id);
            },
            'attributeLevels.stocks'
        ])->findOrFail($id);

        return Controller::OKE('success', 'success get menu', $menu, 200);
    }

    public function update(Request $request, Menu $menu)
    {
        $validated = $request->validate([
            "menu_image" => "sometimes|file|mimes:jpg,jpeg,png,webp|max:2040",
            "name" => "sometimes|string|max:200",
            "category_id" => "sometimes|exists:categories,id",
            "discount_id" => "nullable",
            "description" => "nullable|string",
            "price" => "sometimes|integer|min:0",
            "is_active" => "sometimes|boolean",
            "stocks" => "sometimes|array",
            "stocks.*.stock_id" => "required|exists:stocks,id",
            "stocks.*.amount" => "required|numeric|min:0",
            "stocks.*.unit_id" => "required|exists:units,id",
            "attributes" => "nullable|array",
            "attributes.*.levels" => "required|array",
            "attributes.*.levels.*.attribute_level_id" => "required|exists:attribute_levels,id",
            "level_stocks" => "nullable|array",
        ]);

        return DB::transaction(function () use ($request, $menu, $validated) {
            if ($request->hasFile('menu_image')) {
                if ($menu->menu_image) Storage::disk('public')->delete($menu->menu_image);
                $validated['menu_image'] = $this->handleUpload($request->file('menu_image'));
            }

            if ($request->has('discount_id')) {
                $validated['discount_id'] = $request->filled('discount_id') ? $request->discount_id : null;
            }

            $menu->update($validated);

            if (isset($validated['stocks'])) {
                $syncStocks = [];
                foreach ($validated['stocks'] as $s) {
                    $syncStocks[$s['stock_id']] = [
                        'amount' => $s['amount'],
                        'unit_id' => $s['unit_id']
                    ];
                }
                $menu->stocks()->sync($syncStocks);
            }

            $menu->attributeLevels()->detach();
            if (!empty($validated['attributes'])) {
                foreach ($validated['attributes'] as $attr) {
                    foreach ($attr['levels'] as $level) {
                        $menu->attributeLevels()->attach($level['attribute_level_id'], [
                            'price' => $level['price'] ?? 0
                        ]);
                    }
                }
            }

            if (!empty($validated['level_stocks'])) {
                $levelIds = collect($validated['level_stocks'])->pluck('level_id')->unique();
                DB::table('attribute_level_stocks')->whereIn('attribute_level_id', $levelIds)->delete();

                foreach ($validated['level_stocks'] as $ls) {
                    DB::table('attribute_level_stocks')->insert([
                        'attribute_level_id' => $ls['level_id'],
                        'stock_id'           => $ls['stock_id'],
                        'unit_id'            => $ls['unit_id'],
                        'amount'             => $ls['amount'],
                        'created_at'         => now(),
                        'updated_at'         => now()
                    ]);
                }
            }

            return Controller::OKE('success', 'success update menu', $menu->load(['stocks', 'attributeLevels']), 200);
        });
    }

    public function destroy(Menu $menu)
    {
        return DB::transaction(function () use ($menu) {
            if ($menu->menu_image) Storage::disk('public')->delete($menu->menu_image);
            DB::table('menu_attributes')->where('menu_id', $menu->id)->delete();
            $menu->stocks()->detach();
            $menu->delete();
            return Controller::OKE('success', 'success delete menu', [], 200);
        });
    }

    private function handleUpload($file)
    {
        $filename = 'menu-' . uniqid() . '.webp';
        $path = 'menus/' . $filename;

        $img = Image::read($file)
            ->cover(600, 400)
            ->encodeByExtension('webp', 90);

        Storage::disk('public')->put($path, (string) $img);
        return $path;
    }

    /**
     * Helper: Sync Attributes
     */
    private function syncAttributes($menu, $attributes)
    {
        foreach ($attributes as $attr) {
            foreach ($attr['levels'] as $level) {
                DB::table('menu_attributes')->insert([
                    'menu_id' => $menu->id,
                    'attribute_id' => $attr['attribute_id'],
                    'attribute_level_id' => $level['attribute_level_id'],
                    'created_at' => now(),
                    'updated_at' => now()
                ]);

                if (!empty($level['stocks'])) {
                    foreach ($level['stocks'] as $s) {
                        $stock = Stock::find($s['stock_id']);
                        $unit = Unit::find($s['unit_id']);

                        if ($stock->unit->category !== $unit->category) {
                            throw new \Exception("Unit {$unit->name} tidak cocok untuk {$stock->name}");
                        }

                        DB::table('attribute_level_stocks')->insert([
                            'attribute_level_id' => $level['attribute_level_id'],
                            'stock_id' => $s['stock_id'],
                            'unit_id' => $s['unit_id'],
                            'amount' => $s['amount'],
                            'created_at' => now(),
                            'updated_at' => now()
                        ]);
                    }
                }
            }
        }
    }

    /**
     * Helper: Sorting Logic
     */
    private function applySorting($query, $sortBy, $bestSellerIds)
    {
        switch ($sortBy) {
            case 'best_seller':
                if (!empty($bestSellerIds)) {
                    $query->whereIn('id', $bestSellerIds)->orderByRaw("FIELD(id, " . implode(',', $bestSellerIds) . ")");
                }
                break;
            case 'stock_highest':
                $query->withSum('stocks as total_stock', 'quantity')->orderByDesc('total_stock');
                break;
            case 'price_lowest':
                $query->orderBy('price', 'asc');
                break;
            case 'price_highest':
                $query->orderBy('price', 'desc');
                break;
            default:
                $query->latest();
                break;
        }
    }

    /**
     * Helper: Notify Customers
     */
    private function notifyDiscount($menu, $event)
    {
        $customers = User::whereHas('role', function ($q) {
            $q->where('name', 'customer');
        })->get();

        Notification::send(
            $customers,
            new GeneralNotification($event->message, 'promotion', "/menus/{$menu->id}")
        );
    }
}
