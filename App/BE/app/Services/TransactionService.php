<?php

namespace App\Services;

use App\Models\Transaction;
use Illuminate\Support\Facades\DB;
use App\Services\BookingService;
use Illuminate\Support\Facades\Auth;

class TransactionService
{
    public function create(array $data, array $pricing): Transaction
    {
        return Transaction::create([
            'user_id' => Auth::id(),
            'table_id' => $data['table_id'],
            'transaction_code' => $this->generateBookingCode(),
            'status' => 'pending_payment',
            'total_amount' => $pricing['total'],
            'payment_method' => $data['payment_method'],
            'transaction_date' => now(),
        ]);
    }


    public function markAsPaid(Transaction $transaction, array $payload = []): Transaction
    {
        return DB::transaction(function () use ($transaction, $payload) {

            if ($transaction->status === 'paid') {
                return $transaction;
            }

            $transaction->update([
                'status' => 'paid',
                'paid_at' => now(),
                'amount_paid' => $payload['gross_amount'] ?? $transaction->total_amount,
                'payment_method' => $payload['payment_type'] ?? $transaction->payment_method,
            ]);

            $this->handlePostPayment($transaction);

            return $transaction;
        });
    }


    public function markAsFailed(Transaction $transaction): Transaction
    {
        if (in_array($transaction->status, ['paid', 'failed'])) {
            return $transaction;
        }

        $transaction->update([
            'status' => 'failed'
        ]);

        return $transaction;
    }


    private function handlePostPayment(Transaction $transaction): void
    {
        if ($transaction->booking) {
            app(BookingService::class)->confirm($transaction->booking->fresh());
        }

        app(InventoryService::class)
            ->decrease($transaction);

        $transaction->update([
            'status' => 'to_cook'
        ]);

        event(new \App\Events\PaymentConfirmed($transaction));
    }

    private function generateBookingCode(): string
    {
        return 'BOOKED-' . strtoupper(bin2hex(random_bytes(5)));
    }
}
