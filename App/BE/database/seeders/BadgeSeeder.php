<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Badge;
use Illuminate\Support\Facades\DB;

class BadgeSeeder extends Seeder
{
  public function run(): void
{
    DB::table('badges')->delete();

    $badges = [
        [
            'name' => 'Bronze Member',
            'min_spend' => 0,
            'icon' => 'star',
            'color' => '#CD7F32',
            'is_active' => true,
        ],
        [
            'name' => 'Silver Foodie',
            'min_spend' => 1000000,
            'icon' => 'sparkles',
            'color' => '#C0C0C0',
            'is_active' => true,
        ],
        [
            'name' => 'Gold Gourmet',
            'min_spend' => 5000000,
            'icon' => 'thumbs-up',
            'color' => '#FACC15',
            'is_active' => true,
        ],
        [
            'name' => 'Platinum Legend',
            'min_spend' => 10000000,
            'icon' => 'clock',
            'color' => '#3B82F6',
            'is_active' => true,
        ],
    ];

    foreach ($badges as $badge) {
        Badge::create($badge);
    }
}
}
