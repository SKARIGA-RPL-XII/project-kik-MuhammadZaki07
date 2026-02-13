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
                'name' => 'Best Seller',
                'badge_image' => null,
                'icon' => 'star',
                'color' => '#FACC15',
                'is_active' => true,
            ],
            [
                'name' => 'New',
                'badge_image' => null,
                'icon' => 'sparkles',
                'color' => '#22C55E',
                'is_active' => true,
            ],
            [
                'name' => 'Recommended',
                'badge_image' => null,
                'icon' => 'thumbs-up',
                'color' => '#3B82F6',
                'is_active' => true,
            ],
            [
                'name' => 'Limited',
                'badge_image' => null,
                'icon' => 'clock',
                'color' => '#EF4444',
                'is_active' => true,
            ],
            [
                'name' => 'Hidden',
                'badge_image' => null,
                'icon' => 'eye-off',
                'color' => '#64748B',
                'is_active' => false,
            ],
        ];

        foreach ($badges as $badge) {
            Badge::create($badge);
        }
    }
}
