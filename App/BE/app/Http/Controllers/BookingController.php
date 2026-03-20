<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Table;
use App\Models\User;
use App\Notifications\GeneralNotification;
use App\Services\PosService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class BookingController extends Controller
{
    protected $posService;

    public function __construct(PosService $posService)
    {
        $this->posService = $posService;
    }

    public function store(Request $request)
    {
        $request->validate([
            'table_id' => 'required|exists:tables,id',
            'booking_time' => 'required|date',
            'number_of_people' => 'required|integer|min:1',
            'items' => 'nullable|array',
            'payment_method' => 'required_with:items|in:cash,midtrans,qris',
            'total_amount' => 'required_with:items',
        ]);

        try {
            return DB::transaction(function () use ($request) {
                $user = Auth::user();
                $transactionId = null;
                $snapToken = null;
                $hasItems = $request->has('items') && count($request->items) > 0;
                $settings = DB::table('settings')->pluck('value', 'key')->toArray();

                if ($hasItems) {
                    $orderData = [
                        'table_id' => $request->table_id,
                        'order_type' => 'dine_in',
                        'order_source' => 'qr_code',
                        'items' => $request->items,
                        'payment_method' => $request->payment_method,
                        'customer_name' => $user->username,
                        'total_amount' => $request->total_amount,
                        'settings' => $request->settings
                    ];

                    $orderResult = $this->posService->execute($orderData);

                    if ($request->payment_method !== 'cash' && empty($orderResult['snap_token'])) {
                        throw new Exception("Gagal menginisialisasi pembayaran Midtrans. Silakan coba lagi.");
                    }

                    $transactionId = $orderResult['transaction']->id;
                    $snapToken = $orderResult['snap_token'] ?? null;
                }

                $booking = Booking::create([
                    'user_id' => $user->id,
                    'table_id' => $request->table_id,
                    'booking_time' => $request->booking_time,
                    'number_of_people' => $request->number_of_people,
                    'notes' => $request->notes,
                    'transaction_id' => $transactionId,
                    'status' => 'pending'
                ]);

                $booking->load(['table', 'user']);

                return response()->json([
                    'status' => 'success',
                    'message' => 'Booking created successfully',
                    'data' => [
                        'booking' => $booking,
                        'snap_token' => $snapToken
                    ]
                ], 201);
            });
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Booking failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function index()
    {
        $bookings = Booking::with(['user', 'table', 'transaction'])
            ->orderBy('booking_time', 'asc')
            ->get();
        return response()->json(['status' => 'success', 'data' => $bookings]);
    }

    public function confirm($id)
    {
        try {
            return DB::transaction(function () use ($id) {
                /** @var \App\Models\Booking $booking */
                $booking = Booking::with('table')->findOrFail($id);

                $booking->update(['status' => 'confirmed']);

                if ($booking->table) {
                    $booking->table->update(['status' => 'booked']);
                }

                if ($booking->user) {
                    $booking->user->notify(new GeneralNotification(
                        "Booking meja {$booking->table->table_number} telah dikonfirmasi!",
                        "success",
                        "/history-booking"
                    ));
                }

                return response()->json(['status' => 'success', 'message' => 'Booking confirmed & Table secured']);
            });
        } catch (Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }
}
