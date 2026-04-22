<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            ['key' => 'store_name', 'value' => 'Gagal Lapar', 'group' => 'general'],
            ['key' => 'phone', 'value' => '083846871126', 'group' => 'general'],
            ['key' => 'address', 'value' => 'Jl Mega Permai VI 138 Kompl Koveri RT 002/12, Ngaliyan, Semarang, 024 7628516', 'group' => 'general'],
            ['key' => 'tax_percent', 'value' => 10, 'group' => 'billing'],
            ['key' => 'service_percent', 'value' => 5, 'group' => 'billing'],
            ['key' => 'is_tax_active', 'value' => 1, 'group' => 'billing'],
            ['key' => 'is_service_active', 'value' => 1, 'group' => 'billing'],
            ['key' => 'tax_type', 'value' => 'subtotal_only', 'group' => 'billing'],

            [
                'key' => 'available_methods',
                'group' => 'payment',
                'value' => [
                    ['id' => 'bri_va', 'name' => 'bri_va', 'active' => 1],
                    ['id' => 'bni_va', 'name' => 'bni_va', 'active' => 1],
                    ['id' => 'bca_va', 'name' => 'bca_va', 'active' => 1],
                    ['id' => 'dana', 'name' => 'dana', 'active' => 1],
                    ['id' => 'shopeepay', 'name' => 'shopeepay', 'active' => 1],
                    ['id' => 'qris', 'name' => 'qris', 'active' => 1],
                ]
            ],

            ['key' => 'company_name', 'value' => 'PT Nero Coffee & Roastery APP', 'group' => 'system'],
            ['key' => 'currency_symbol', 'value' => 'Rp', 'group' => 'system'],
            ['key' => 'timezone', 'value' => 'Asia/Jakarta', 'group' => 'system'],
            ['key' => 'low_stock_threshold', 'value' => 10, 'group' => 'system'],
            ['key' => 'auto_print_receipt', 'value' => true, 'group' => 'system'],
            ['key' => 'session_timeout', 'value' => 120, 'group' => 'system'],
            ['key' => 'maintenance_mode', 'value' => false, 'group' => 'system'],

            [
                'key' => 'role_permissions',
                'group' => 'security',
                'value' => [
                    'admin' => [
                        'overview' => ['write', 'delete', 'view'],
                        'dashboard' => ['view', 'delete', 'write'],
                        'calendar' => ['view', 'write', 'delete'],
                        'settings' => ['view', 'write', 'delete'],
                        'general' => ['view', 'write', 'delete'],
                        'tax & service' => ['delete', 'write', 'view'],
                        'payment methods' => ['view', 'write', 'delete'],
                        'roles & permissions' => ['delete', 'write', 'view'],
                        'system config' => ['view', 'write', 'delete'],
                        'master data' => ['view', 'write', 'delete'],
                        'menu' => ['view', 'write', 'delete'],
                        'category' => ['delete', 'write', 'view'],
                        'banner' => ['view', 'delete', 'write'],
                        'discount' => ['view', 'write', 'delete'],
                        'badge' => ['view', 'delete', 'write'],
                        'table & room' => ['view', 'write', 'delete'],
                        'cashier' => ['view'],
                        'account' => ['view', 'write', 'delete'],
                        'staff' => ['delete', 'write', 'view'],
                        'admin' => ['view', 'write', 'delete'],
                        'user profile' => ['delete', 'write', 'view'],
                        'reports' => ['view', 'delete', 'write'],
                        'sales report' => ['view', 'write', 'delete'],
                        'daily revenue' => ['view', 'write', 'delete'],
                        'top selling menu' => ['delete', 'write', 'view'],
                        'transaction history' => ['view', 'write', 'delete'],
                        'inventory' => ['delete', 'view', 'write'],
                        'stock list' => ['view', 'write', 'delete'],
                        'stock adjustment' => ['delete', 'write', 'view'],
                        'suppliers' => ['view', 'write', 'delete'],
                        'operations' => ['view', 'write', 'delete'],
                        'order queue' => ['view'],
                        'reservation' => ['delete', 'view', 'write'],
                        'kitchen display' => ['delete', 'write', 'view'],
                        'notifications' => ['view', 'write', 'delete'],
                        'system logs' => ['view', 'write', 'delete'],
                        'activity history' => ['view', 'write', 'delete'],
                        'table' => ['view', 'delete', 'write'],
                        'general settings' => ['view', 'write', 'delete'],
                        'account & settings' => ['view', 'write', 'delete'],
                        'table list' => ['view'],
                        'report explorer' => ['view', 'write', 'delete'],
                        'attendance' => [],
                        'leave & permits' => [],
                        'duty schedule' => ['view', 'write', 'delete'],
                        'leave' => ['view', 'write', 'delete'],
                        'leaves approval' => ['write', 'delete', 'view'],
                        'attendance logs' => ['view', 'write', 'delete']
                    ],
                    'cashier' => [
                        'overview' => ['view'],
                        'dashboard' => ['view'],
                        'calendar' => ['view', 'write'],
                        'cashier' => ['view', 'write', 'delete'],
                        'user profile' => ['write', 'view'],
                        'account' => ['view'],
                        'sales report' => ['view', 'write'],
                        'reports' => ['view', 'write'],
                        'daily revenue' => ['write', 'view'],
                        'top selling menu' => ['view', 'write'],
                        'transaction history' => ['view', 'write'],
                        'operations' => ['view', 'write'],
                        'order queue' => ['view', 'write', 'delete'],
                        'kitchen display' => ['view', 'write'],
                        'reservation' => ['view', 'write'],
                        'stock list' => ['view', 'write', 'delete'],
                        'inventory' => ['view', 'write', 'delete'],
                        'stock adjustment' => ['view', 'delete', 'write'],
                        'suppliers' => ['view', 'write', 'delete'],
                        'table' => ['view', 'write', 'delete'],
                        'notifications' => ['view', 'write', 'delete'],
                        'table list' => ['view', 'write', 'delete'],
                        'master data' => ['view', 'write', 'delete'],
                        'menu' => ['view', 'write', 'delete'],
                        'category' => ['view'],
                        'banner' => ['view'],
                        'discount' => ['view'],
                        'badge' => ['view'],
                        'table & room' => ['view', 'write', 'delete'],
                        'system logs' => ['write', 'view'],
                        'staff' => ['view'],
                        'account & settings' => ['view'],
                        'attendance' => ['view', 'write', 'delete'],
                        'leave & permits' => ['view', 'write', 'delete'],
                        'report explorer' => [],
                        'tax & service' => [],
                        'admin' => []
                    ],
                    'employe' => [
                        'calendar' => ['view'],
                        'overview' => ['view'],
                        'dashboard' => ['view', 'write', 'delete'],
                        'menu' => [],
                        'master data' => [],
                        'category' => [],
                        'banner' => [],
                        'discount' => [],
                        'badge' => [],
                        'table & room' => [],
                        'cashier' => [],
                        'user profile' => ['view', 'write'],
                        'account' => ['view'],
                        'reservation' => [],
                        'operations' => ['view'],
                        'kitchen display' => ['view'],
                        'order queue' => ['view'],
                        'sales report' => [],
                        'reports' => [],
                        'attendance' => ['view', 'write', 'delete'],
                        'leave & permits' => ['view', 'write', 'delete'],
                        'notifications' => ['view', 'delete', 'write'],
                        'table list' => ['view']
                    ]
                ]
            ],
        ];

        foreach ($settings as $setting) {
            Setting::set(
                $setting['key'],
                $setting['value'],
                $setting['group']
            );
        }
    }
}
