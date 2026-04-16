<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Transaction;
use App\Services\BookingService;
use App\Services\BookingActionService;
use Illuminate\Http\Request;
use Midtrans\Snap;
use Exception;
use Illuminate\Support\Facades\Log;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $query = Booking::with(['user', 'table', 'transaction.details.menu']);

        if ($request->search) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->whereHas('user', fn($q) => $q->where('username', 'like', "%$search%"))
                    ->orWhereHas('table', fn($q) => $q->where('table_number', 'like', "%$search%"));
            });
        }

        return response()->json([
            'status' => 'success',
            'data' => $query->latest('booking_time')->get()
        ]);
    }

    public function store(Request $request, BookingService $service)
    {
        $data = $request->validate([
            'table_id' => 'required',
            'booking_time' => 'required',
            'number_of_people' => 'required',
            'items' => 'nullable|array',
            'payment_method' => 'required',
            'notes' => 'nullable',
            'settings' => 'nullable|array',
            'settings.tax_percent' => 'nullable|numeric',
            'settings.service_percent' => 'nullable|numeric',
        ]);

        //  Log::info('BOOKING_REQUEST', $data);

        return response()->json([
            'status' => 'success',
            'data' => $service->create($data)
        ]);
    }

    public function reject(Request $request, BookingActionService $service, $id)
    {
        $booking = $service->reject(
            $id,
            $request->reason ?? 'Kendala teknis di restoran'
        );

        $waLink = $this->buildWaLink($booking);

        return response()->json([
            'status' => 'success',
            'message' => 'Booking berhasil di-reject.',
            'wa_link' => $waLink
        ]);
    }

    public function approve(BookingActionService $service, $id)
    {
        $booking = $service->approve($id);

        return response()->json([
            'status' => 'success',
            'message' => 'Booking dikonfirmasi manual.',
            'data' => $booking
        ]);
    }

    public function destroy(BookingActionService $service, $id)
    {
        $service->delete($id);

        return response()->json([
            'status' => 'success',
            'message' => 'Booking berhasil dihapus.'
        ]);
    }

    public function getSnapToken($id)
    {
        $transaction = Transaction::with('user')->findOrFail($id);

        if ($transaction->snap_token) {
            return response()->json([
                'snap_token' => $transaction->snap_token
            ]);
        }

        try {
            $params = [
                'transaction_details' => [
                    'order_id' => $transaction->transaction_code,
                    'gross_amount' => (int) $transaction->total_amount,
                ],
                'customer_details' => [
                    'first_name' => $transaction->user->name ?? 'Customer',
                    'email' => $transaction->user->email ?? 'customer@mail.com',
                ],
            ];

            $snapToken = Snap::getSnapToken($params);

            $transaction->update(['snap_token' => $snapToken]);

            return response()->json(['snap_token' => $snapToken]);
        } catch (Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 500);
        }
    }

    private function buildWaLink($booking)
    {
        $phone = $booking->user->no_tlp ?? '628xxxxxxxx';

        $message = "Halo {$booking->user->username}, " .
            "reservasi Anda (#{$booking->transaction->transaction_code}) dibatalkan. " .
            "Silakan hubungi admin untuk info refund.";

        return "https://wa.me/{$phone}?text=" . urlencode($message);
    }
}
