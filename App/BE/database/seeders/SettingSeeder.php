<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            'store_name' => 'My Restaurant',
            'phone' => '08123456789',
            'address' => 'Jl. Contoh Alamat No. 123',
            'theme' => 'light',

            'tax_percentage' => '10',
            'service_percentage' => '5',

            'cash_enabled' => '1',
            'qris_enabled' => '1',
            'card_enabled' => '0',

            'sidebar_config' => json_encode([
                'dashboard' => true,
                'menu' => true,
                'reports' => true,
            ]),

            'pages_config' => json_encode([
                'reservation' => true,
                'kitchen_display' => true,
            ]),
        ];

        foreach ($settings as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }
    }
}
