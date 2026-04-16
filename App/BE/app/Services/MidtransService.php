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
        $grossAmount = (string) $notification['gross_amount'];
        $signatureKey = $notification['signature_key'];

        $validSignature = hash("sha512", $orderId . $statusCode . $grossAmount . $serverKey);

        if ($signatureKey !== $validSignature) {
            Log::error("Midtrans: Invalid Signature", [
                'order_id' => $orderId
            ]);
            return null;
        }

        $baseOrderId = preg_replace('/-\d+$/', '', $orderId);

        $transaction = Transaction::where('transaction_code', $baseOrderId)->first();

        if (!$transaction) {
            Log::error("Transaction not found", [
                'order_id' => $orderId,
                'base' => $baseOrderId
            ]);
            return null;
        }

        $status = $notification['transaction_status'];

        if (in_array($status, ['settlement', 'capture'])) {

            $updateData = [
                'status' => 'paid',
                'payment_method' => $notification['payment_type'] ?? 'midtrans',
                'amount_paid' => (int) $grossAmount,
                'paid_at' => now(),
            ];

            $booking = Booking::where('transaction_id', $transaction->id)->first();

            if ($booking) {
                $transaction->update($updateData);
                $booking->update(['status' => 'confirmed']);

                if ($booking->table_id) {
                    Table::where('id', $booking->table_id)->update(['status' => 'booked']);
                }
            } else {
                $transaction->update(array_merge($updateData, [
                    'status' => 'to_cook'
                ]));
            }

            try {
                $this->posService->completePaymentProcess($transaction);
            } catch (Exception $e) {
                Log::error("Stock deduction failed", [
                    'msg' => $e->getMessage()
                ]);
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

        return $transaction;
    }
}
