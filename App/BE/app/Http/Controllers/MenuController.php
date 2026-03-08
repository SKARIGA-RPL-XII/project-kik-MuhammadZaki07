<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use App\Models\User;
use App\Models\Attribute;
use App\Models\AttributeLevel;
use App\Events\MenuDiscountCreated;
use App\Events\MenuDiscountUpdate;
use App\Events\MenuDiscountUpdated;
use App\Events\ProductDiscountUpdated;
use App\Notifications\GeneralNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Notification;
use Intervention\Image\Laravel\Facades\Image;

class MenuController extends Controller
{
    public function index(Request $request)
    {
        $page = max(0, (int) $request->query('page', 1) - 1);

        $bestSellerIds = DB::table('transaction_details')
            ->select('menu_id', DB::raw('SUM(menu_qty) as total_sold'))
            ->groupBy('menu_id')
            ->orderByDesc('total_sold')
            ->take(5)
            ->pluck('menu_id')
            ->toArray();

        $query = Menu::with([
            'category',
            'discount',
            'attributes.levels',
            'stocks'
        ])->where("menus.is_active", true);

        if ($request->filled('search')) {
            $query->where('menus.name', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('category')) {
            $cat = $request->category;
            $query->where(function ($q) use ($cat) {
                $q->where('category_id', $cat)
                    ->orWhereHas('category', fn($query) => $query->where('slug', $cat));
            });
        }

        if ($request->filled('sort_by')) {
            switch ($request->sort_by) {
                case 'best_seller':
                    if (!empty($bestSellerIds)) {
                        $idsOrder = implode(',', $bestSellerIds);
                        $query->whereIn('menus.id', $bestSellerIds)
                            ->orderByRaw("FIELD(menus.id, {$idsOrder})");
                    }
                    break;
                case 'stock_highest':
                    $query->withSum('stocks as total_stock', 'quantity')
                        ->orderByDesc('total_stock');
                    break;
                case 'price_lowest':
                    $query->orderBy('menus.price', 'asc');
                    break;
                case 'price_highest':
                    $query->orderBy('menus.price', 'desc');
                    break;
                default:
                    $query->latest('menus.created_at');
                    break;
            }
        } else {
            $query->latest('menus.created_at');
        }

        $total = $query->count();

        if ($request->filled('size')) {
            $size = max(1, (int) $request->size);
            $data = $query->skip($page * $size)->take($size)->get();
        } else {
            $data = $query->get();
            $size = $total;
        }

        $data->map(function ($menu) use ($bestSellerIds) {
            $menu->is_best_seller = in_array($menu->id, $bestSellerIds);
            return $menu;
        });

        return Controller::OKE(
            'success',
            'success get menus',
            [
                "menus" => $data,
                "metadata" => [
                    "page" => $request->filled('size') ? $page + 1 : 1,
                    "size" => (int) $size,
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

        $bestSellerIds = DB::table('transaction_details')
            ->select('menu_id', DB::raw('SUM(menu_qty) as total_sold'))
            ->groupBy('menu_id')
            ->orderByDesc('total_sold')
            ->take(5)
            ->pluck('menu_id')
            ->toArray();

        $query = Menu::with([
            'category',
            'discount',
            'attributes.levels',
            'stocks'
        ]);

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('category')) {
            $query->where('category_id', $request->category);
        }

        $total = $query->count();

        $data = $query
            ->latest()
            ->skip($page * $size)
            ->take($size)
            ->get();

        $data->map(function ($menu) use ($bestSellerIds) {
            $menu->is_best_seller = in_array($menu->id, $bestSellerIds);
            return $menu;
        });

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
            "discount_id" => "nullable",
            "description" => "nullable|string",
            "price" => "required|integer|min:0",
            "is_active" => "required|boolean",
            "attributes" => "nullable|array",
            "stocks" => "required|array|min:1",
            "stocks.*.stock_id" => "required|exists:stocks,id",
            "stocks.*.amount" => "required|numeric|min:0.01"
        ]);

        return DB::transaction(function () use ($request, $validated) {
            $file = $request->file('menu_image');
            $filename = 'menu-' . uniqid() . '.webp';
            $directory = 'menus/';
            $fullPath = storage_path('app/public/' . $directory . $filename);

            if (!file_exists(storage_path('app/public/' . $directory))) {
                mkdir(storage_path('app/public/' . $directory), 0755, true);
            }

            Image::read($file)
                ->scale(1000)
                ->encodeByExtension('webp', 90)
                ->save($fullPath);

            $path = $directory . $filename;

            $menu = Menu::create([
                "menu_image" => $path,
                "name" => $validated['name'],
                "category_id" => $validated['category_id'],
                "discount_id" => $request->filled('discount_id') ? $validated['discount_id'] : null,
                "description" => $validated['description'] ?? null,
                "price" => $validated['price'],
                "is_active" => $validated['is_active']
            ]);

            if ($menu->discount_id) {
                $customers = User::where('role', 'customer')->get();
                $event = new MenuDiscountCreated($menu);

                $link = "/menus/" . $menu->id;
                Notification::send($customers, new GeneralNotification($event->message, 'promotion', $link));
            }

            foreach ($validated['stocks'] as $stockItem) {
                $menu->stocks()->attach($stockItem['stock_id'], [
                    'amount' => $stockItem['amount'],
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }

            if (!empty($validated['attributes'])) {
                $syncData = [];
                foreach ($validated['attributes'] as $attrId => $levelIds) {
                    foreach (array_unique($levelIds) as $levelId) {
                        $syncData[] = [
                            'menu_id' => $menu->id,
                            'attribute_id' => $attrId,
                            'attribute_level_id' => $levelId,
                            'created_at' => now(),
                            'updated_at' => now()
                        ];
                    }
                }
                DB::table('menu_attributes')->insert($syncData);
            }

            return Controller::OKE('success', 'success create menu', $menu->load(['stocks', 'attributes.levels']), 201);
        });
    }

    public function show($id)
    {
        $menu = Menu::with([
            'category',
            'discount',
            'attributes.levels',
            'stocks'
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
            "attributes" => "nullable|array",
            "stocks" => "sometimes|array|min:1",
            "stocks.*.stock_id" => "required|exists:stocks,id",
            "stocks.*.amount" => "required|numeric|min:0.01"
        ]);

        return DB::transaction(function () use ($request, $menu, $validated) {
            $oldDiscountId = $menu->discount_id;

            if ($request->hasFile('menu_image')) {
                if ($menu->menu_image) {
                    Storage::disk('public')->delete($menu->menu_image);
                }

                $file = $request->file('menu_image');
                $filename = 'menu-' . uniqid() . '.webp';
                $directory = 'menus/';
                $fullPath = storage_path('app/public/' . $directory . $filename);

                if (!file_exists(storage_path('app/public/' . $directory))) {
                    mkdir(storage_path('app/public/' . $directory), 0755, true);
                }

                Image::read($file)
                    ->scale(1000)
                    ->encodeByExtension('webp', 90)
                    ->save($fullPath);

                $validated['menu_image'] = $directory . $filename;
            }

            if ($request->has('discount_id')) {
                $validated['discount_id'] = $request->filled('discount_id') ? $request->discount_id : null;
            }

            $menu->update($validated);

            if ($menu->discount_id && ($oldDiscountId != $menu->discount_id)) {
                $customers = User::where('role', 'customer')->get();
                $event = new MenuDiscountUpdate($menu);

                $link = "/menus/" . $menu->id;
                Notification::send($customers, new GeneralNotification($event->message, 'promotion', $link));
            }
            if (isset($validated['stocks'])) {
                $syncStocks = [];
                foreach ($validated['stocks'] as $item) {
                    $syncStocks[$item['stock_id']] = [
                        'amount' => $item['amount'],
                        'updated_at' => now()
                    ];
                }
                $menu->stocks()->sync($syncStocks);
            }

            if (isset($validated['attributes'])) {
                DB::table('menu_attributes')->where('menu_id', $menu->id)->delete();
                $syncData = [];
                foreach ($validated['attributes'] as $attrId => $levelIds) {
                    if (!is_array($levelIds)) continue;
                    foreach (array_unique($levelIds) as $levelId) {
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
                    DB::table('menu_attributes')->insert($syncData);
                }
            }

            return Controller::OKE('success', 'success update menu', $menu->load(['stocks', 'attributes.levels']), 200);
        });
    }

    public function destroy(Menu $menu)
    {
        return DB::transaction(function () use ($menu) {
            if ($menu->menu_image) {
                Storage::disk('public')->delete($menu->menu_image);
            }

            DB::table('menu_attributes')->where('menu_id', $menu->id)->delete();
            $menu->stocks()->detach();
            $menu->delete();

            return Controller::OKE('success', 'success delete menu', [], 200);
        });
    }
}
