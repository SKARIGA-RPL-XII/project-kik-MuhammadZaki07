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
            $transactionId = null;
            $snapToken = null;
            $user = Auth::user();

            // 1. Jalankan PosService (Sama seperti transaksi suksesmu)
            if ($request->has('items') && count($request->items) > 0) {
                $orderData = [
                    'table_id' => $request->table_id,
                    'order_type' => 'dine_in',
                    'order_source' => 'qr_code',
                    'items' => $request->items,
                    'payment_method' => $request->payment_method,
                    'customer_name' => $user->username,
                    'total_amount' => $request->total_amount,
                    'settings' => $request->settings // Ambil dari React
                ];

                $orderResult = $this->posService->execute($orderData);
                $transactionId = $orderResult['transaction']->id;
                $snapToken = $orderResult['snap_token'];
            }

            // 2. Simpan Booking (Ini logic tambahan untuk booking)
            $booking = Booking::create([
                'user_id' => $user->id,
                'table_id' => $request->table_id,
                'booking_time' => $request->booking_time,
                'number_of_people' => $request->number_of_people,
                'notes' => $request->notes,
                'transaction_id' => $transactionId,
                'status' => 'pending'
            ]);

            // 3. NOTIFIKASI (BAGIAN KRITIS)
            // Saya bungkus try-catch agar SQL Error 'role' tidak membatalkan Booking
            try {
                // Notif ke Customer (Diri sendiri)
                $user->notify(new GeneralNotification(
                    "Booking berhasil dibuat!",
                    "info",
                    "/profile-customer?tab=orders"
                ));

                // Query Admin & Cashier pakai ROLE_ID (Sesuai Seeder)
                // Admin = 1, Cashier = 5
                $staffs = \App\Models\User::whereIn('role_id', [1, 5])->get();
                foreach ($staffs as $staff) {
                    $staff->notify(new GeneralNotification(
                        "Ada booking baru dari {$user->username}",
                        "success",
                        "/admin/bookings"
                    ));
                }
            } catch (\Exception $notifError) {
                // JANGAN THROW ERROR DI SINI
                // Biarkan booking tetap tersimpan meski notifikasi gagal
                \Log::error("Notif Error: " . $notifError->getMessage());
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Booking created successfully',
                'data' => [
                    'booking' => $booking,
                    'snap_token' => $snapToken
                ]
            ], 201);
        });
    } catch (\Exception $e) {
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
            DB::beginTransaction();
            $booking = Booking::with('user')->findOrFail($id);
            $booking->update(['status' => 'confirmed']);
            Table::where('id', $booking->table_id)->update(['status' => 'booked']);

            if ($booking->user) {
                $booking->user->notify(new GeneralNotification(
                    "Booking kamu untuk meja " . ($booking->table->number ?? $id) . " telah dikonfirmasi!",
                    "success",
                    "/history-booking"
                ));
            }

            DB::commit();
            return response()->json(['status' => 'success', 'message' => 'Booking confirmed']);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }
}
