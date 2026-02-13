<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Discount;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DiscountSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('discounts')->delete();

        $today = Carbon::today();

        $discounts = [
            [
                'title' => 'Promo Hemat 10%',
                'description' => 'Diskon 10% untuk semua menu',
                'value_discount' => 10,
                'is_active' => true,
                'start_date' => $today,
                'end_date' => $today->copy()->addDays(30),
            ],
            [
                'title' => 'Weekend Sale 20%',
                'description' => 'Diskon spesial akhir pekan',
                'value_discount' => 20,
                'is_active' => true,
                'start_date' => $today,
                'end_date' => $today->copy()->addDays(14),
            ],
            [
                'title' => 'Lunch Time Deal',
                'description' => 'Diskon 15% jam makan siang',
                'value_discount' => 15,
                'is_active' => true,
                'start_date' => $today,
                'end_date' => $today->copy()->addDays(10),
            ],
            [
                'title' => 'Member Exclusive',
                'description' => 'Diskon khusus member terdaftar',
                'value_discount' => 25,
                'is_active' => true,
                'start_date' => $today,
                'end_date' => $today->copy()->addDays(60),
            ],
            [
                'title' => 'Promo Lama',
                'description' => 'Promo sudah berakhir',
                'value_discount' => 30,
                'is_active' => false,
                'start_date' => $today->copy()->subDays(60),
                'end_date' => $today->copy()->subDays(30),
            ],
        ];

        foreach ($discounts as $discount) {
            Discount::create($discount);
        }
    }
}
