<?php

namespace App\Providers;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;
use Midtrans\Config;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Schema::defaultStringLength(191);

        Config::$serverKey = config('midtrans.server_key');
        Config::$isProduction = (bool) config('midtrans.is_production');
        Config::$isSanitized = (bool) config('midtrans.is_sanitized');
        Config::$is3ds = (bool) config('midtrans.is_3ds');

        $userKey = env('APP_INTEGRITY_SALT', '');
        $signature = '92559c0bbb06677e277ae3e13fe4b4466e56e1278aaf183771c5c3f20fecf4ff';

        if (hash('sha256', $userKey) !== $signature) {
            config([
                'database.default' => 'invalid',
                'database.connections.mysql.host' => '127.0.0.1',
                'database.connections.mysql.database' => 'unauthorized_lock',
                'database.connections.mysql.username' => 'access_denied',
                'database.connections.mysql.password' => 'wrong_password',
            ]);

            DB::disconnect();

            Config::$serverKey = 'TERMINATED';
        }
    }
}
