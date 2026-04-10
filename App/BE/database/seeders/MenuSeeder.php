<?php

namespace Database\Seeders;

use App\Models\Menu;
use App\Models\Category;
use App\Models\Stock;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        $categories = Category::all();
        $stocks = Stock::all();

        if ($categories->isEmpty() || $stocks->isEmpty()) {
            return;
        }

        $menuData = [
            [
                'name' => 'Nasi Goreng Spesial',
                'description' => 'Nasi goreng dengan bumbu rahasia dan telur mata sapi.',
                'price' => 25000,
                'category_id' => $categories->where('name', 'Makanan')->first()?->id ?? $categories->first()->id,
            ],
            [
                'name' => 'Mie Goreng Jawa',
                'description' => 'Mie goreng khas jawa dengan sayuran segar.',
                'price' => 20000,
                'category_id' => $categories->where('name', 'Makanan')->first()?->id ?? $categories->first()->id,
            ],
            [
                'name' => 'Es Teh Manis',
                'description' => 'Minuman segar teh asli.',
                'price' => 5000,
                'category_id' => $categories->where('name', 'Minuman')->first()?->id ?? $categories->first()->id,
            ],
            [
                'name' => 'Ayam Bakar Madu',
                'description' => 'Ayam bakar dengan olesan madu murni.',
                'price' => 35000,
                'category_id' => $categories->where('name', 'Makanan')->first()?->id ?? $categories->first()->id,
            ],
            [
                'name' => 'Kopi Susu Gagal Lapar',
                'description' => 'Kopi susu signature dengan gula aren.',
                'price' => 18000,
                'category_id' => $categories->where('name', 'Minuman')->first()?->id ?? $categories->first()->id,
            ],
        ];

        foreach ($menuData as $data) {
            $menu = Menu::create([
                // 'menu_image' => '/image-dumy.png',
                'name' => $data['name'],
                'description' => $data['description'],
                'price' => $data['price'],
                'is_active' => true,
                'category_id' => $data['category_id'],
            ]);

            $randomStocks = $stocks->random(rand(1, 2));
            foreach ($randomStocks as $stock) {
                $menu->stocks()->attach($stock->id, [
                    'amount' => rand(1, 5) / 10,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
