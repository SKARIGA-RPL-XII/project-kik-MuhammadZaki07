<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoomSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('rooms')->truncate();

        DB::table('rooms')->insert([
            [
                'id' => 1,
                'name' => 'Indoor A',
                'capacity' => 12,
                'color' => '#3B82F6',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'name' => 'Indoor B',
                'capacity' => 10,
                'color' => '#6366F1',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'name' => 'Outdoor',
                'capacity' => 8,
                'color' => '#10B981',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 4,
                'name' => 'VIP 1',
                'capacity' => 4,
                'color' => '#F59E0B',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 5,
                'name' => 'VIP 2',
                'capacity' => 4,
                'color' => '#EF4444',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
