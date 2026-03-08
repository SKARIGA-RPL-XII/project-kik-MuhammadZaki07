<?php

namespace App\Events;

use App\Models\Transaction;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PaymentConfirmed implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $transaction;

    public function __construct(Transaction $transaction)
    {
        $this->transaction = $transaction;
    }

    public function broadcastOn()
    {
        return new Channel('transactions.' . $this->transaction->id);
    }

    public function broadcastAs()
    {
        return 'payment.confirmed';
    }

    public function broadcastWith()
    {
        return [
            'id' => $this->transaction->id,
            'status' => $this->transaction->status,
            'message' => 'Payment has been confirmed successfully'
        ];
    }
}
