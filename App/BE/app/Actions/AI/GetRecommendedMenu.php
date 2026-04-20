<?php

namespace App\Actions\AI;

use App\DTO\AIRequestDTO;
use App\Models\Menu;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class GetRecommendedMenu
{
    public function handle(AIRequestDTO $dto, array $filters = [])
    {
        $query = Menu::query()
            ->with(['discount', 'attributes.levels'])
            ->where('is_active', true)
            ->where('calculated_stock', '>', 0);

        if (!empty($filters['spicy'])) {
            $query->where(function ($q) {
                $q->where('name', 'like', '%pedas%')
                    ->orWhereHas('attributes', function ($attr) {
                        $attr->where('name', 'like', '%pedas%');
                    });
            });
        }

        $menus = $query->limit(10)->get();

        return $this->mapMenus($menus);
    }

    protected function mapMenus($menus)
    {
        return $menus->map(function ($menu) {
            return [
                'id' => $menu->id,
                'name' => $menu->name,

                'original_price' => $menu->price,
                'final_price' => $menu->final_price,

                'description' => $menu->description,
                'stock' => $menu->calculated_stock,
                'image' => $menu->menu_image,

                'discount' => $menu->discount ? [
                    'id' => $menu->discount->id,
                    'type' => $menu->discount->type,
                    'value' => $menu->discount->value_discount,
                ] : null,

                'attributes' => $menu->attributes->map(fn($attr) => [
                    'id' => $attr->id,
                    'name' => $attr->name,
                    'levels' => $attr->levels->map(fn($lvl) => [
                        'id' => $lvl->id,
                        'name' => $lvl->name,
                    ])
                ])
            ];
        })->values()->toArray();
    }
}
