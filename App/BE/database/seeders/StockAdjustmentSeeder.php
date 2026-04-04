<?php

namespace Database\Seeders;

use App\Models\Stock;
use App\Models\User;
use App\Models\StockAdjustment;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StockAdjustmentSeeder extends Seeder
{
    public function run(): void
    {
        $stocks = Stock::all();

        // Perbaikan Logic: Mencari user dengan role 'admin' melalui relasi
        $admin = User::whereHas('role', function($q) {
            $q->where('name', 'admin');
        })->first() ?? User::first();

        if ($stocks->isEmpty() || !$admin) return;

        $adjustments = [
            ['stock_id' => $stocks[0]->id, 'type' => 'in', 'amount' => 20, 'reason' => 'Restock dari Supplier A'],
            ['stock_id' => $stocks[1]->id, 'type' => 'out', 'amount' => 5, 'reason' => 'Bahan baku kadaluarsa'],
            ['stock_id' => $stocks[2]->id, 'type' => 'in', 'amount' => 50, 'reason' => 'Kulakan pasar pagi'],
            ['stock_id' => $stocks[3]->id, 'type' => 'out', 'amount' => 2, 'reason' => 'Minyak tumpah di gudang'],
            ['stock_id' => $stocks[4]->id, 'type' => 'in', 'amount' => 10, 'reason' => 'Koreksi kelebihan hitung'],
            ['stock_id' => $stocks[5]->id, 'type' => 'out', 'amount' => 1, 'reason' => 'Barang rusak/busuk'],
            ['stock_id' => $stocks[6]->id, 'type' => 'in', 'amount' => 15, 'reason' => 'Bonus dari supplier'],
            ['stock_id' => $stocks[7]->id, 'type' => 'out', 'amount' => 3, 'reason' => 'Dipakai untuk test food'],
            ['stock_id' => $stocks[8]->id, 'type' => 'in', 'amount' => 100, 'reason' => 'Stok awal pembukaan'],
            ['stock_id' => $stocks[9]->id, 'type' => 'out', 'amount' => 5, 'reason' => 'Waste harian'],
        ];

        foreach ($adjustments as $adj) {
            if (isset($adj['stock_id'])) {
                StockAdjustment::create(array_merge($adj, [
                    'user_id' => $admin->id,
                    'created_at' => now()->subHours(rand(1, 72)),
                ]));
            }
        }
    }
}
