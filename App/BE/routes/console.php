<?php

use App\Models\Table;
use App\Models\Transaction;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('discounts:clear-expired')->daily();
Schedule::call(function () {
    $expiredTransactions = Transaction::where('status', 'pending_payment')
        ->where('created_at', '<', now()->subHour())
        ->get();

    foreach ($expiredTransactions as $transaction) {
        $transaction->update(['status' => 'cancelled']);

        if ($transaction->table_id) {
            Table::where('id', $transaction->table_id)->update(['status' => 'available']);
        }

        Log::info("Scheduler: Transaction {$transaction->transaction_code} auto-cancelled.");
    }
})->everyMinute();

Schedule::command('attendance:process-alpha')->dailyAt('23:55');
