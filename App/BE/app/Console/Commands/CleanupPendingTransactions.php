<?php

namespace App\Console\Commands;

use App\Models\Transaction;
use Illuminate\Console\Command;

class CleanupPendingTransactions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:cleanup-pending-transactions';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $expiredTransactions = Transaction::where('status', 'pending_payment')
            ->where('created_at', '<', now()->subHour())
            ->get();

        foreach ($expiredTransactions as $transaction) {
            $transaction->update(['status' => 'cancelled']);

            if ($transaction->table_id) {
                $transaction->table->update(['status' => 'available']);
            }

            $this->info("Transaction {$transaction->transaction_code} has been cancelled due to timeout.");
        }
    }
}
