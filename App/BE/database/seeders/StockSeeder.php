<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StockSeeder extends Seeder
{
    public function run(): void
    {
        $units = DB::table('units')->get()->keyBy('abbreviation');

        $stocks = [
            ['name' => 'Ayam Fillet', 'unit' => 'kg', 'qty' => 50, 'min' => 10],
            ['name' => 'Nasi Putih', 'unit' => 'kg', 'qty' => 100, 'min' => 20],
            ['name' => 'Telur Ayam', 'unit' => 'pcs', 'qty' => 200, 'min' => 50],
            ['name' => 'Minyak Goreng', 'unit' => 'L', 'qty' => 20, 'min' => 5],
            ['name' => 'Bawang Merah', 'unit' => 'kg', 'qty' => 5, 'min' => 2],
            ['name' => 'Bawang Putih', 'unit' => 'kg', 'qty' => 4, 'min' => 2],
            ['name' => 'Cabai Merah', 'unit' => 'kg', 'qty' => 10, 'min' => 3],
            ['name' => 'Garam', 'unit' => 'pack', 'qty' => 15, 'min' => 5],
            ['name' => 'Gula Pasir', 'unit' => 'kg', 'qty' => 25, 'min' => 10],
            ['name' => 'Teh Celup', 'unit' => 'box', 'qty' => 30, 'min' => 10],
        ];

        foreach ($stocks as $item) {
            $unitData = $units->get($item['unit']);

            if ($unitData) {
                $multiplier = (int) $unitData->multiplier;

                DB::table('stocks')->insert([
                    'name' => $item['name'],
                    'unit_id' => $unitData->id,
                    'min_unit_id' => $unitData->id,
                    'supplier_id' => 1,
                    'quantity' => $item['qty'] * $multiplier,
                    'low_stock_threshold' => $item['min'] * $multiplier,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
