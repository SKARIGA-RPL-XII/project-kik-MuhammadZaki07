<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Notifications\GeneralNotification;
use App\Services\LogService;
use App\Services\PosService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Exception;
use Illuminate\Support\Facades\Log;
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
            'payment_method'   => 'required',
        ]);

        try {
            return DB::transaction(function () use ($request) {
                $startTime = \Carbon\Carbon::parse($request->booking_time);
                $endTime = $startTime->copy()->addMinutes(120);

                $isBooked = Booking::where('table_id', $request->table_id)
                    ->whereIn('status', ['pending_payment', 'pending_confirmation', 'confirmed'])
                    ->where(function ($query) use ($startTime, $endTime) {
                        $query->where('booking_time', '<', $endTime)
                            ->where('end_time', '>', $startTime);
                    })
                    ->exists();

                if ($isBooked) {
                    throw new Exception("Maaf, meja ini sudah dipesan pada jam tersebut.");
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
                } else {
                    $transaction = \App\Models\Transaction::create([
                        'user_id' => Auth::id(),
                        'transaction_code' => 'BK-' . strtoupper(\Illuminate\Support\Str::random(8)),
                        'total_amount' => 50000,
                        'status' => 'pending',
                        'payment_method' => 'midtrans'
                    ]);

                    $transactionId = $transaction->id;
                    $snapResponse = $this->getSnapToken($transactionId);
                    $snapToken = $snapResponse->getData()->snap_token;
                }

                $booking = Booking::create([
                    'user_id'          => Auth::id(),
                    'table_id'         => $request->table_id,
                    'booking_time'     => $startTime,
                    'end_time'         => $endTime,
                    'number_of_people' => $request->number_of_people,
                    'notes'            => $request->notes,
                    'transaction_id'   => $transactionId,
                    'status'           => 'pending_payment'
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

    public function approve($id)
    {
        try {
            return DB::transaction(function () use ($id) {
                $booking = Booking::with(['table', 'transaction', 'user'])->findOrFail($id);

                if ($booking->status !== 'pending_confirmation') {
                    return response()->json([
                        'status' => 'error',
                        'message' => "Hanya booking status 'pending_confirmation' yang bisa di-approve."
                    ], 400);
                }

                // 1. Update Booking
                $booking->update(['status' => 'confirmed']);

                // 2. Update Meja jadi 'booked' (bukan 'occupied' lagi kalau belum jamnya)
                if ($booking->table) {
                    $booking->table->update(['status' => 'booked']);
                }

                // 3. Proses Stok/POS
                if ($booking->transaction) {
                    $this->posService->completePaymentProcess($booking->transaction);
                }

                // 4. Catat Log Aktivitas (Sangat Penting buat Laporan Admin)
                \App\Services\LogService::write(
                    'Booking',
                    'Approve',
                    "Admin mengonfirmasi booking #{$booking->id} untuk user {$booking->user->username}",
                    ['status' => 'pending_confirmation'],
                    ['status' => 'confirmed']
                );

                // 5. Notifikasi User
                if ($booking->user) {
                    $booking->user->notify(new GeneralNotification(
                        "Reservasi Berhasil! Meja {$booking->table->table_number} sudah kami siapkan untukmu.",
                        "booking_success",
                        "/history-booking"
                    ));
                }

                return response()->json([
                    'status' => 'success',
                    'message' => 'Booking berhasil dikonfirmasi oleh Admin.'
                ]);
            });
        } catch (Exception $e) {
            Log::error("Gagal Approve Booking: " . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => 'Terjadi kesalahan sistem.'], 500);
        }
    }

    public function reject(Request $request, $id)
    {
        try {
            return DB::transaction(function () use ($request, $id) {
                $booking = Booking::with(['table', 'transaction', 'user'])->findOrFail($id);
                $reason = $request->reason ?? 'Kendala teknis di restoran';

                $booking->update(['status' => 'cancelled']);
                if ($booking->transaction) {
                    $booking->transaction->update(['status' => 'cancelled']);
                }

                if ($booking->table) {
                    $booking->table->update(['status' => 'available']);
                }

                LogService::write(
                    'Booking',
                    'Reject',
                    "Admin membatalkan booking #{$booking->id}. Alasan: {$reason}",
                    ['status' => $booking->getOriginal('status')],
                    ['status' => 'cancelled']
                );

                $phoneNumber = $booking->user->no_tlp ?? '628xxxxxxxx';
                $message = "Halo {$booking->user->username}, kami dari Restoran Gagal-Lapar. " .
                    "Mohon maaf, reservasi Anda (#{$booking->transaction->transaction_code}) terpaksa kami batalkan karena: {$reason}. " .
                    "Uang Anda sebesar Rp" . number_format($booking->transaction->total_amount) . " akan kami kembalikan via transfer. Mohon kirimkan nomor rekening Anda.";

                $waLink = "https://wa.me/{$phoneNumber}?text=" . urlencode($message);

                return response()->json([
                    'status' => 'success',
                    'message' => 'Booking berhasil di-reject.',
                    'wa_link' => $waLink
                ]);
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
