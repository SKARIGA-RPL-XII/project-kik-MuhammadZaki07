<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Table;
use Illuminate\Support\Facades\DB;

class BookingActionService
{
    public function reject(int $bookingId, string $reason = 'Kendala teknis di restoran')
    {
        $booking = DB::transaction(function () use ($bookingId, $reason) {
            $booking = Booking::with(['table', 'transaction', 'user'])
                ->findOrFail($bookingId);

            $booking->update(['status' => 'cancelled']);

            if ($booking->transaction) {
                $booking->transaction->update(['status' => 'cancelled']);
            }

            if ($booking->table) {
                $booking->table->update(['status' => 'available']);
            }

            return $booking;
        });

        return $booking;
    }

    public function approve(int $bookingId): Booking
    {
        $booking = DB::transaction(function () use ($bookingId) {

            $booking = Booking::with(['table', 'transaction'])
                ->findOrFail($bookingId);

            if ($booking->status === 'confirmed') {
                return $booking;
            }

            $booking->update(['status' => 'confirmed']);

            if ($booking->table) {
                $booking->table->update(['status' => 'booked']);
            }

            if ($booking->transaction && $booking->transaction->status !== 'paid') {
                $booking->transaction->update([
                    'status' => 'paid',
                    'paid_at' => now()
                ]);
            }

            return $booking;
        });

        return $booking;
    }

    public function delete(int $bookingId)
    {
        return DB::transaction(function () use ($bookingId) {

            $booking = Booking::findOrFail($bookingId);

            if ($booking->table_id) {
                Table::where('id', $booking->table_id)
                    ->update(['status' => 'available']);
            }

            if ($booking->transaction_id) {
                $booking->transaction()->update(['status' => 'cancelled']);
            }

            $booking->delete();

            return true;
        });
    }
}
