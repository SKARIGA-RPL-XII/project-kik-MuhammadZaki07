<?php

namespace App\Actions\AI;

use App\Models\Menu;
use Illuminate\Support\Facades\Cache;

class GetMenuList
{
    public function handle()
    {
        return Cache::remember('ai:menu:list', now()->addMinutes(30), function () {

            return Menu::query()
                ->with(['discount', 'attributes.levels'])
                ->where('is_active', true)
                ->limit(20)
                ->get()
                ->map(function ($menu) {

                    return [
                        'id' => $menu->id,
                        'name' => $menu->name,
                        'price' => $menu->final_price,
                        'final_price' => $menu->final_price,
                        'original_price' => $menu->price,
                        'description' => $menu->description,
                        'stock' => $menu->calculated_stock,

                        'image' => $menu->menu_image,
                        
                        'discount' => $menu->discount ? [
                            'id' => $menu->discount->id,
                            'type' => $menu->discount->type,
                            'value' => $menu->discount->value_discount,
                        ] : null,

                        'attributes' => $menu->attributes
                            ->unique('id')
                            ->map(function ($attr) {
                                return [
                                    'id' => $attr->id,
                                    'name' => $attr->name,
                                    'levels' => $attr->levels
                                        ->map(function ($lvl) {
                                            return [
                                                'id' => $lvl->id,
                                                'name' => $lvl->name,
                                                // 'price' => $lvl->price ?? 0,
                                            ];
                                        })
                                        ->values()
                                        ->toArray(),
                                ];
                            })
                            ->values()
                            ->toArray(),
                    ];
                })
                ->values()
                ->toArray();
        });
    }
}
