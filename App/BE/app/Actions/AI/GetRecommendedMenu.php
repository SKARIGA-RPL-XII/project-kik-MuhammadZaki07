<?php

namespace App\Actions\AI;

use App\DTO\AIRequestDTO;
use App\Models\Menu;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class GetRecommendedMenu
{
    public function handle(AIRequestDTO $dto)
    {
        $cacheKey = "ai:recommend:user:{$dto->userId}";

        return Cache::remember($cacheKey, now()->addMinutes(10), function () use ($dto) {

            $menuIds = DB::table('transaction_details')
                ->join('transactions', 'transactions.id', '=', 'transaction_details.transaction_id')
                ->where('transactions.user_id', $dto->userId)
                ->where('transactions.status', 'completed')
                ->select(
                    'transaction_details.menu_id',
                    DB::raw('COUNT(*) as freq'),
                    DB::raw('MAX(transactions.transaction_date) as last_order')
                )
                ->groupBy('transaction_details.menu_id')
                ->orderByDesc('last_order')
                ->orderByDesc('freq')
                ->limit(5)
                ->pluck('menu_id');

            if ($menuIds->isNotEmpty()) {
                return $this->mapMenus(
                    Menu::query()
                        ->with(['discount', 'attributes'])
                        ->whereIn('id', $menuIds)
                        ->where('is_active', true)
                        ->get()
                );
            }

            $popularIds = DB::table('transaction_details')
                ->select('menu_id', DB::raw('COUNT(*) as total'))
                ->groupBy('menu_id')
                ->orderByDesc('total')
                ->limit(5)
                ->pluck('menu_id');

            if ($popularIds->isNotEmpty()) {
                return $this->mapMenus(
                    Menu::query()
                        ->with(['discount', 'attributes'])
                        ->whereIn('id', $popularIds)
                        ->where('is_active', true)
                        ->get()
                );
            }

            return $this->mapMenus(
                Menu::query()
                    ->with(['discount', 'attributes'])
                    ->where('is_active', true)
                    ->limit(5)
                    ->get()
            );
        });
    }

    protected function mapMenus($menus)
    {
        return $menus->map(function ($menu) {
            return [
                'id' => $menu->id,
                'name' => $menu->name,
                'price' => $menu->final_price,
                'final_price' => $menu->final_price,
                'original_price' => $menu->price,
                'description' => $menu->description,
                'stock' => $menu->calculated_stock,
                'image' => $menu->menu_image,
                'discount_id' => $menu->discount_id,
                'attributes' => $menu->attributes->map(fn($attr) => [
                    'id' => $attr->id,
                    'name' => $attr->name,
                ])->values(),
            ];
        })->values()->toArray();
    }
}
