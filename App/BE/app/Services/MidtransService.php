<?php

namespace App\Services;

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

        $lastHyphenPos = strrpos($orderId, '-');
        if ($lastHyphenPos !== false) {
            $originalCode = substr($orderId, 0, $lastHyphenPos);
        } else {
            $originalCode = $orderId;
        }

        Log::info("DEBUG: Midtrans kirim $orderId | Hasil potong jadi: $originalCode");

        $transaction = Transaction::where('transaction_code', $originalCode)->first();

        if ($transaction) {
            $status = $notification['transaction_status'];

            if ($status == 'settlement' || $status == 'capture') {
                Log::info("Mulai update status lunas untuk: " . $transaction->transaction_code);

                $transaction->update([
                    'status'         => 'to_cook',
                    'payment_method' => $notification['payment_type'] ?? 'midtrans',
                    'amount_paid'    => (int) $notification['gross_amount'],
                    'change_amount'  => 0,
                    'paid_at'        => now(),
                ]);

                try {
                    $this->posService->completePaymentProcess($transaction);
                    Log::info("Stok berhasil dikurangi untuk: " . $transaction->transaction_code);
                } catch (Exception $e) {
                    Log::error("Gagal potong stok di Webhook: " . $e->getMessage());
                }

                Log::info("Webhook Success Full Process: " . $transaction->transaction_code);
            } elseif (in_array($status, ['deny', 'expire', 'cancel'])) {
                $transaction->update(['status' => 'failed']);

                if ($transaction->table_id) {
                    Table::where('id', $transaction->table_id)->update(['status' => 'available']);
                }
                Log::info("Webhook: Transaksi " . $transaction->transaction_code . " gagal/expired.");
            }
        } else {
            Log::warning("Webhook Warning: Transaksi $originalCode tidak ditemukan di DB.");
        }

        return $transaction;
    }
}
