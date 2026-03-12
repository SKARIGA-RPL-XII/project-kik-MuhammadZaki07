<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\Table;
use App\Models\User;
use App\Notifications\GeneralNotification;
use App\Services\PosService;

class MidtransService
{
    protected $posService;

    public function __construct(PosService $posService)
    {
        $this->posService = $posService;
    }

    public function handleNotification(array $payload)
    {
        $orderIdParts = explode('-', $payload['order_id']);
        $transactionId = $orderIdParts[1];

        $transaction = Transaction::with('details')->findOrFail($transactionId);

        $status = $payload['transaction_status'];
        $type = $payload['payment_type'];

        if ($status == 'settlement' || $status == 'capture') {
            if ($transaction->status !== 'paid') {
                $transaction->update([
                    'status' => 'paid',
                    'paid_at' => now(),
                    'payment_method' => $type
                ]);

                $this->posService->decreaseInventory($transaction);

                if ($transaction->user_id) {
                    $user = User::find($transaction->user_id);
                    $user->notify(new GeneralNotification(
                        "Pembayaran Berhasil! Pesanan {$transaction->transaction_code} sedang disiapkan. Terima kasih sudah memesan!",
                        'payment_success',
                        '/profile-customer'
                    ));
                }
            }
        } elseif ($status == 'expire' || $status == 'cancel' || $status == 'deny') {
            $transaction->update(['status' => 'failed']);

            if ($transaction->table_id) {
                Table::where('id', $transaction->table_id)->update(['status' => 'available']);
            }
        }

        return $transaction;
    }
}
