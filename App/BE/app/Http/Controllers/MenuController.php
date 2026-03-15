<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use App\Models\User;
use App\Events\MenuDiscountCreated;
use App\Events\MenuDiscountUpdate;
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
            "stocks" => "required|array|min:1",
            "stocks.*.stock_id" => "required|exists:stocks,id",
            "stocks.*.amount" => "required|numeric|min:0.01"
        ]);

        return DB::transaction(function () use ($request, $validated) {
            $path = $this->handleUpload($request->file('menu_image'));

            $menu = Menu::create(array_merge($validated, ["menu_image" => $path]));
            foreach ($validated['stocks'] as $stockItem) {
                $menu->stocks()->attach($stockItem['stock_id'], [
                    'amount' => $stockItem['amount'],
                    'created_at' => now(), 'updated_at' => now()
                ]);
            }

            if (!empty($validated['attributes'])) {
                $this->syncAttributes($menu, $validated['attributes']);
            }

            if ($menu->discount_id) {
                $this->notifyDiscount($menu, new MenuDiscountCreated($menu));
            }

            return Controller::OKE('success', 'success create menu', $menu->load(['stocks', 'attributes.levels']), 201);
        });
    }

    public function show($id)
    {
        $menu = Menu::with(['category', 'discount', 'attributes.levels', 'stocks'])->findOrFail($id);
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
                if ($menu->menu_image) Storage::disk('public')->delete($menu->menu_image);
                $validated['menu_image'] = $this->handleUpload($request->file('menu_image'));
            }

            if ($request->has('discount_id')) {
                $validated['discount_id'] = $request->filled('discount_id') ? $request->discount_id : null;
            }

            $menu->update($validated);

            if (isset($validated['stocks'])) {
                $syncStocks = collect($validated['stocks'])->mapWithKeys(fn($item) => [
                    $item['stock_id'] => ['amount' => $item['amount'], 'updated_at' => now()]
                ])->toArray();
                $menu->stocks()->sync($syncStocks);
            }

            if (isset($validated['attributes'])) {
                DB::table('menu_attributes')->where('menu_id', $menu->id)->delete();
                $this->syncAttributes($menu, $validated['attributes']);
            }

            if ($menu->discount_id && ($oldDiscountId != $menu->discount_id)) {
                $this->notifyDiscount($menu, new MenuDiscountUpdate($menu));
            }

            return Controller::OKE('success', 'success update menu', $menu->load(['stocks', 'attributes.levels']), 200);
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

    /**
     * Helper: Handle Image Upload & Optimization
     */
    private function handleUpload($file)
    {
        $filename = 'menu-' . uniqid() . '.webp';
        $path = 'menus/' . $filename;

        $img = Image::read($file)
            ->cover(600, 400)
            ->encodeByExtension('jpg', 80);

        Storage::disk('public')->put($path, (string) $img);
        return $path;
    }

    /**
     * Helper: Sync Attributes
     */
    private function syncAttributes($menu, $attributes)
    {
        $syncData = [];
        foreach ($attributes as $attrId => $levelIds) {
            if (!is_array($levelIds)) continue;
            foreach (array_unique($levelIds) as $levelId) {
                $syncData[] = [
                    'menu_id' => $menu->id, 'attribute_id' => $attrId,
                    'attribute_level_id' => $levelId, 'created_at' => now(), 'updated_at' => now()
                ];
            }
        }
        if (!empty($syncData)) DB::table('menu_attributes')->insert($syncData);
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
            case 'price_lowest': $query->orderBy('price', 'asc'); break;
            case 'price_highest': $query->orderBy('price', 'desc'); break;
            default: $query->latest(); break;
        }
    }

    /**
     * Helper: Notify Customers
     */
    private function notifyDiscount($menu, $event)
    {
        $customers = User::where('role', 'customer')->get();
        Notification::send($customers, new GeneralNotification($event->message, 'promotion', "/menus/{$menu->id}"));
    }
}
