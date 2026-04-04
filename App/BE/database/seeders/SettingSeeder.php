<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            ['key' => 'tax_percent', 'value' => '10', 'group' => 'billing'],
            ['key' => 'service_percent', 'value' => '5', 'group' => 'billing'],
            ['key' => 'is_tax_active', 'value' => '1', 'group' => 'billing'],
            ['key' => 'is_service_active', 'value' => '1', 'group' => 'billing'],
            ['key' => 'tax_type', 'value' => 'subtotal_only', 'group' => 'billing'],
            ['key' => 'store_name', 'value' => 'Gagal Lapar', 'group' => 'general'],
            ['key' => 'phone', 'value' => '083846871126', 'group' => 'general'],
            ['key' => 'address', 'value' => 'Jl Mega Permai VI 138 Kompl Koveri RT 002/12, Ngaliyan', 'group' => 'general'],
            [
                'key' => 'available_methods',
                'value' => json_encode([
                    ['id' => 'qris', 'name' => 'QRIS', 'active' => 1],
                    ['id' => 'bri', 'name' => 'Transfer BRI', 'active' => 1],
                    ['id' => 'cash', 'name' => 'Tunai', 'active' => 1]
                ]),
                'group' => 'payment'
            ],
            [
                'key' => 'role_permissions',
                'value' => json_encode([
                    'admin' => [
                        'dashboard' => ['view', 'write', 'delete'],
                        'settings' => ['view', 'write']
                    ],
                    'cashier' => [
                        'overview' => ['view'],
                        'cashier' => ['view', 'write'],
                        'orders' => ['view']
                    ]
                ]),
                'group' => 'security'
            ],
            ['key' => 'company_name', 'value' => 'PT Nero Coffee & Roastery APP', 'group' => 'system'],
            ['key' => 'currency_symbol', 'value' => 'Rp', 'group' => 'system'],
            ['key' => 'timezone', 'value' => 'Asia/Jakarta', 'group' => 'system'],
            ['key' => 'low_stock_threshold', 'value' => '10', 'group' => 'system'],
            ['key' => 'auto_print_receipt', 'value' => '1', 'group' => 'system'],
            ['key' => 'session_timeout', 'value' => '120', 'group' => 'system'],
            ['key' => 'maintenance_mode', 'value' => '0', 'group' => 'system'],
            ['key' => 'enable_negative_stock', 'value' => '0', 'group' => 'inventory'],
            ['key' => 'stock_warning_email', 'value' => 'admin@nero-coffee.com', 'group' => 'inventory'],
            ['key' => 'kitchen_display_refresh', 'value' => '10', 'group' => 'operation'],
            ['key' => 'reservation_timeout', 'value' => '30', 'group' => 'operation'],
            ['key' => 'log_retention', 'value' => '30', 'group' => 'security'],
        ];

        foreach ($settings as $setting) {
            DB::table('settings')->updateOrInsert(
                ['key' => $setting['key'], 'group' => $setting['group']],
                ['value' => $setting['value']]
            );
        }
    }
}
