<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Notifications\GeneralNotification;
use App\Services\PosService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Exception;
use Midtrans\Snap;

class BookingController extends Controller
{
    protected $posService;

    public function __construct(PosService $posService)
    {
        $this->posService = $posService;
    }

    public function index()
    {
        $bookings = Booking::with(['user', 'table', 'transaction.details.menu'])
            ->orderBy('booking_time', 'desc')
            ->get();

        return response()->json(['status' => 'success', 'data' => $bookings]);
    }

public function store(Request $request)
{
    $request->validate([
        'table_id'         => 'required|exists:tables,id',
        'booking_time'     => 'required|date',
        'number_of_people' => 'required|integer|min:1',
        'items'            => 'nullable|array',
        'payment_method'   => 'required_with:items',
    ]);

    try {
        return DB::transaction(function () use ($request) {
            $startTime = \Carbon\Carbon::parse($request->booking_time);
            $endTime = $startTime->copy()->addMinutes(120);

            $isBooked = Booking::where('table_id', $request->table_id)
                ->whereIn('status', ['pending', 'confirmed'])
                ->where(function ($query) use ($startTime, $endTime) {
                    $query->where('booking_time', '<', $endTime)
                          ->where('end_time', '>', $startTime);
                })
                ->exists();

            if ($isBooked) {
                throw new Exception("Maaf, meja ini sudah dipesan pada jam tersebut. Silakan pilih waktu atau meja lain.");
            }

            $transactionId = null;
            $snapToken     = null;

            if ($request->has('items') && count($request->items) > 0) {
                $orderResult = $this->posService->executeBooking([
                    'table_id'       => $request->table_id,
                    'items'          => $request->items,
                    'payment_method' => $request->payment_method,
                    'settings'       => $request->settings
                ]);

                $transactionId = $orderResult['transaction']->id;
                $snapToken     = $orderResult['snap_token'];
            }

            $booking = Booking::create([
                'user_id'          => Auth::id(),
                'table_id'         => $request->table_id,
                'booking_time'     => $startTime,
                'end_time'         => $endTime,
                'number_of_people' => $request->number_of_people,
                'notes'            => $request->notes,
                'transaction_id'   => $transactionId,
                'status'           => 'pending'
            ]);

            return response()->json([
                'status' => 'success',
                'data' => [
                    'booking'    => $booking->load('table'),
                    'snap_token' => $snapToken
                ]
            ], 201);
        });
    } catch (Exception $e) {
        return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
    }
}

    public function confirm($id)
    {
        try {
            return DB::transaction(function () use ($id) {
                $booking = Booking::with(['table', 'transaction.details.menu', 'user'])->findOrFail($id);

                if ($booking->status !== 'pending') {
                    throw new Exception("Booking has already been processed.");
                }

                $booking->update(['status' => 'confirmed']);

                if ($booking->table) {
                    $booking->table->update(['status' => 'booked']);
                }

                if ($booking->transaction) {
                    $this->posService->completePaymentProcess($booking->transaction);
                }

                if ($booking->user) {
                    $booking->user->notify(new GeneralNotification(
                        "Booking meja {$booking->table->table_number} telah dikonfirmasi!",
                        "success",
                        "/history-booking"
                    ));
                }

                return response()->json(['status' => 'success']);
            });
        } catch (Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function getSnapToken($id)
    {
        $transaction = \App\Models\Transaction::with(['user'])->findOrFail($id);

        if ($transaction->snap_token) {
            return response()->json(['snap_token' => $transaction->snap_token]);
        }

        $params = [
            'transaction_details' => [
                'order_id' => $transaction->transaction_code,
                'gross_amount' => (int) $transaction->total_amount,
            ],
            'customer_details' => [
                'first_name' => $transaction->user->name ?? $transaction->customer_name ?? 'Customer',
                'email' => $transaction->user->email ?? 'customer@mail.com',
            ],
        ];

        try {
            $snapToken = Snap::getSnapToken($params);

            $transaction->update(['snap_token' => $snapToken]);

            return response()->json(['snap_token' => $snapToken]);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}
