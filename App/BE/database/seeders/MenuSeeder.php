<?php

namespace Database\Seeders;

use App\Models\Menu;
use App\Models\Category;
use App\Models\Stock;
use App\Models\Attribute;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        $categories = Category::all();
        $stocks = Stock::all();
        $attributes = Attribute::with('levels')->get();

        if ($categories->isEmpty() || $stocks->isEmpty()) {
            return;
        }

        $menuData = [
            [
                'name' => 'Nasi Goreng Spesial',
                'description' => 'Nasi goreng dengan bumbu rahasia dan telur mata sapi.',
                'price' => 25000,
                'category' => 'Makanan',
                'ingredients' => [
                    'Nasi Putih' => 250,
                    'Telur Ayam' => 1,
                    'Bawang Merah' => 10,
                ],
                'attr' => ['Pedas']
            ],
            [
                'name' => 'Es Teh Manis',
                'description' => 'Minuman segar teh asli.',
                'price' => 5000,
                'category' => 'Minuman',
                'ingredients' => [
                    'Teh Celup' => 1,
                    'Gula Pasir' => 20,
                ],
                'attr' => ['Manis']
            ],
        ];

        foreach ($menuData as $data) {
            $category = $categories->where('name', $data['category'])->first() ?? $categories->first();

            $menu = Menu::create([
                'name' => $data['name'],
                'description' => $data['description'],
                'price' => $data['price'],
                'is_active' => true,
                'category_id' => $category->id,
            ]);

            foreach ($data['ingredients'] as $stockName => $amount) {
                $stock = $stocks->where('name', $stockName)->first();
                if ($stock) {
                    $menu->stocks()->attach($stock->id, [
                        'amount' => $amount,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            if (isset($data['attr'])) {
                foreach ($data['attr'] as $attrName) {
                    $attribute = $attributes->where('name', $attrName)->first();
                    if ($attribute) {
                        foreach ($attribute->levels as $level) {
                            DB::table('menu_attributes')->insert([
                                'menu_id' => $menu->id,
                                'attribute_id' => $attribute->id,
                                'attribute_level_id' => $level->id,
                                'created_at' => now(),
                                'updated_at' => now(),
                            ]);
                        }
                    }
                }
            }
        }
    }
}
