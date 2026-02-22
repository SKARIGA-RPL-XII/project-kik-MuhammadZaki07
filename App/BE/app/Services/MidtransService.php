<?php
namespace App\Services;

use App\Models\Transaction;
use App\Events\OrderProcessed;

class MidtransService
{
    public function handleNotification(array $notification)
    {
        $transactionStatus = $notification['transaction_status'];
        $paymentType = $notification['payment_type'];
        $orderId = $notification['order_id'];
        $fraudStatus = $notification['fraud_status'];

        $transaction = Transaction::where('order_number', $orderId)->first();

        if (!$transaction) return;

        if ($transactionStatus == 'settlement' || $transactionStatus == 'capture') {
            if ($fraudStatus == 'challenge') {
                $transaction->update(['status' => 'pending_payment']);
            } else {
                $this->finalizePayment($transaction);
            }
        } elseif ($transactionStatus == 'cancel' || $transactionStatus == 'deny' || $transactionStatus == 'expire') {
            $transaction->update(['status' => 'cancelled']);
            if ($transaction->table_id) {
                $transaction->table()->update(['status' => 'available']);
            }
        }

        event(new OrderProcessed($transaction));

        return $transaction;
    }

    private function finalizePayment($transaction)
    {
        $transaction->update([
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        $transaction->details()->update(['status' => 'pending']);
    }
}
