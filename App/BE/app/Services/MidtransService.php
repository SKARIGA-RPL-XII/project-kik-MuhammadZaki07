<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Transaction;
use App\Models\Table;
use Exception;
use Illuminate\Support\Facades\Log;

class MidtransService
{
    protected $posService;

    public function __construct(PosService $posService)
    {
        $this->posService = $posService;
    }

    public function handleNotification($notification)
    {
        $serverKey = config('midtrans.server_key');
        $orderId = $notification['order_id'];
        $statusCode = $notification['status_code'];
        $grossAmount = $notification['gross_amount'];
        $signatureKey = $notification['signature_key'];

        $validSignature = hash("sha512", $orderId . $statusCode . $grossAmount . $serverKey);
        if ($signatureKey !== $validSignature) {
            Log::error("Midtrans: Invalid Signature untuk Order " . $orderId);
            return null;
        }

        $transaction = Transaction::where('transaction_code', $orderId)->first();

        if (!$transaction) {
            $lastHyphenPos = strrpos($orderId, '-');
            if ($lastHyphenPos !== false) {
                $originalCode = substr($orderId, 0, $lastHyphenPos);
                $transaction = Transaction::where('transaction_code', $originalCode)->first();
            }
        }

        if ($transaction) {
            $status = $notification['transaction_status'];

            if (in_array($status, ['settlement', 'capture'])) {
                $booking = Booking::where('transaction_id', $transaction->id)->first();

                if ($booking) {
                    $transaction->update([
                        'status'         => 'paid',
                        'payment_method' => $notification['payment_type'] ?? 'midtrans',
                        'amount_paid'    => (int) $notification['gross_amount'],
                        'paid_at'        => now(),
                    ]);

                    $booking->update(['status' => 'pending_confirmation']);
                } else {
                    $transaction->update([
                        'status'         => 'to_cook',
                        'payment_method' => $notification['payment_type'] ?? 'midtrans',
                        'amount_paid'    => (int) $notification['gross_amount'],
                        'change_amount'  => 0,
                        'paid_at'        => now(),
                    ]);

                    try {
                        $this->posService->completePaymentProcess($transaction);
                    } catch (Exception $e) {
                        Log::error("Gagal potong stok di Webhook: " . $e->getMessage());
                    }
                }
            } elseif (in_array($status, ['deny', 'expire', 'cancel'])) {
                $transaction->update(['status' => 'failed']);

                $booking = Booking::where('transaction_id', $transaction->id)->first();
                if ($booking) {
                    $booking->update(['status' => 'cancelled']);

                    if ($booking->table_id) {
                        Table::where('id', $booking->table_id)->update(['status' => 'available']);
                    }
                }
            }
        } else {
            Log::warning("Webhook Warning: Transaksi $orderId tidak ditemukan di DB.");
        }

        return $transaction;
    }
}
