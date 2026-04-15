<?php

namespace App\Jobs;

use App\Events\NewOrderReceived;
use App\Events\PaymentConfirmed;
use App\Models\Transaction;
use App\Services\PosService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Bus\Queueable as BusQueueable;

class ProcessPaymentJob implements ShouldQueue
{
    use BusQueueable, SerializesModels, InteractsWithQueue;

    public int $transactionId;

    public function __construct(int $transactionId)
    {
        $this->transactionId = $transactionId;
    }

    public function handle()
    {
        $transaction = Transaction::with(['details.menu', 'table', 'user'])
            ->find($this->transactionId);

        if (!$transaction) return;

        if ($transaction->inventory_processed) return;

        app(PosService::class)->decreaseInventory($transaction);

        $transaction->update([
            'inventory_processed' => true,
            'status' => 'cooking'
        ]);

        event(new PaymentConfirmed($transaction));
        event(new NewOrderReceived($transaction));
    }
}
