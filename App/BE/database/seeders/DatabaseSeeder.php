<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        $this->call([
            RoleSeeder::class,
            UserSeeder::class,
            CategorySeeder::class,
            BadgeSeeder::class,
            DiscountSeeder::class,
            TableSeeder::class,
            SettingSeeder::class,
            AttributeSeeder::class,
            AttributeLevelSeeder::class,
        ]);

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }
}
