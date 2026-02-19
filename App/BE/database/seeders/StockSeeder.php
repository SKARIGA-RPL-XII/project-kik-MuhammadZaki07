<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StockSeeder extends Seeder
{
    public function run(): void
    {
        $stocks = [
            ['name' => 'Ayam Fillet', 'unit' => 'kg', 'quantity' => 50, 'low_stock_threshold' => 10],
            ['name' => 'Nasi Putih', 'unit' => 'kg', 'quantity' => 100, 'low_stock_threshold' => 20],
            ['name' => 'Telur Ayam', 'unit' => 'butir', 'quantity' => 200, 'low_stock_threshold' => 50],
            ['name' => 'Minyak Goreng', 'unit' => 'liter', 'quantity' => 20, 'low_stock_threshold' => 5],
            ['name' => 'Bawang Merah', 'unit' => 'kg', 'quantity' => 5, 'low_stock_threshold' => 2],
            ['name' => 'Bawang Putih', 'unit' => 'kg', 'quantity' => 4, 'low_stock_threshold' => 2],
            ['name' => 'Cabai Merah', 'unit' => 'kg', 'quantity' => 10, 'low_stock_threshold' => 3],
            ['name' => 'Garam', 'unit' => 'pack', 'quantity' => 15, 'low_stock_threshold' => 5],
            ['name' => 'Gula Pasir', 'unit' => 'kg', 'quantity' => 25, 'low_stock_threshold' => 10],
            ['name' => 'Teh Celup', 'unit' => 'box', 'quantity' => 30, 'low_stock_threshold' => 10],
        ];

        foreach ($stocks as $stock) {
            DB::table('stocks')->insert(array_merge($stock, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }
}
