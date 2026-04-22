<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AttributeLevelStockSeeder extends Seeder
{
    public function run(): void
    {
        $unitGram = DB::table('units')->where('abbreviation', 'g')->first();
        $stockCabai = DB::table('stocks')->where('name', 'like', '%Cabai%')->first();
        $attrPedas = DB::table('attributes')->where('name', 'Pedas')->first();

        if ($stockCabai && $unitGram && $attrPedas) {
            $levelPedas = DB::table('attribute_levels')
                ->where('attribute_id', $attrPedas->id)
                ->where('name', 'Pedas')
                ->first();

            $levelSangatPedas = DB::table('attribute_levels')
                ->where('attribute_id', $attrPedas->id)
                ->where('name', 'Sangat Pedas')
                ->first();

            $data = [
                [
                    'attribute_level_id' => $levelPedas->id,
                    'stock_id'           => $stockCabai->id,
                    'unit_id'            => $unitGram->id,
                    'amount'             => 20.00,
                    'created_at'         => now(),
                    'updated_at'         => now(),
                ],
                [
                    'attribute_level_id' => $levelSangatPedas->id,
                    'stock_id'           => $stockCabai->id,
                    'unit_id'            => $unitGram->id,
                    'amount'             => 50.00,
                    'created_at'         => now(),
                    'updated_at'         => now(),
                ],
            ];

            DB::table('attribute_level_stocks')->insert($data);
        }
    }
}
