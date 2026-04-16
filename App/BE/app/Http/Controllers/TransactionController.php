<?php

namespace App\Http\Controllers;

use App\Events\NewOrderReceived;
use App\Events\PaymentConfirmed;
use App\Exports\TransactionsExport;
use App\Http\Controllers\Controller;
use App\Jobs\ProcessPaymentJob;
use App\Models\Setting;
use App\Services\PosService;
use App\Models\Transaction;
use App\Notifications\GeneralNotification;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Facades\Excel;
use Midtrans\Config;
use Midtrans\Snap;

class TransactionController extends Controller
{
    protected $posService;

    public function __construct(PosService $posService)
    {
        $this->posService = $posService;
    }

    public function index(Request $request)
    {
        $query = Transaction::select([
            'id',
            'table_id',
            'user_id',
            'status',
            'total_amount',
            'payment_method',
            'order_source',
            'created_at',
            'cooking_started_at',
            'completed_at'
        ])
            ->with([
                'user:id,username',
                'table:id,table_number,qr_code',
                'details:id,transaction_id,menu_id,menu_qty,subtotal,attributes,price',
                'details.menu:id,name,menu_image'
            ])
            ->whereIn('status', ['paid', 'to_cook', 'cooking'])
            ->orderBy('created_at', 'asc');

        $query->when($request->order_source, function ($q) use ($request) {
            return $q->where('order_source', $request->order_source);
        });

        try {
            $transactions = $query->get();

            return response()->json([
                'status' => 'success',
                'data' => $transactions
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Database error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function searchByCode($code)
    {
        try {
            $transaction = Transaction::with(['table', 'details.menu'])
                ->where('transaction_code', $code)
                ->first();

            if (!$transaction) {
                return response()->json([
                    'success' => false,
                    'message' => 'Transaction not found.'
                ], 404);
            }

            $invalidStatuses = ['paid', 'completed', 'cancelled'];

            if (in_array($transaction->status, $invalidStatuses)) {
                return response()->json([
                    'success' => false,
                    'message' => 'This order cannot be paid anymore.'
                ], 400);
            }

            return response()->json([
                'success' => true,
                'data' => $transaction
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'System error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_source' => 'required|in:customer_app,qr_code,cashier_direct',
            'order_type' => 'required|in:dine_in,take_away',
            'table_id' => 'nullable|required_if:order_type,dine_in|exists:tables,id',
            'payment_method' => 'required',
            'items' => 'required|array|min:1',
            'items.*.menu_id' => 'required|exists:menus,id',
            'items.*.quantity' => 'required|integer|min:1',
            'settings' => 'required|array'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $cashierId = Auth::check() ? Auth::user()->id : null;

            $result = $this->posService->execute($request->all(), $cashierId);

            $transaction = $result['transaction'];
            $transaction->load(['details.menu', 'table', 'user']);

            event(new NewOrderReceived($transaction));

            return response()->json([
                'status' => 'success',
                'message' => 'Transaction created',
                'data' => $transaction,
                'snap_token' => $result['snap_token'] ?? null
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:cooking,completed,cancelled'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $transaction = Transaction::findOrFail($id);

            $updateData = ['status' => $request->status];

            if ($request->status === 'cooking' && !$transaction->cooking_started_at) {
                $updateData['cooking_started_at'] = now();
            }

            if ($request->status === 'completed') {
                $updateData['completed_at'] = now();
                $updateData['status'] = 'completed';
                $updateData['total_duration'] = $transaction->created_at->diffInMinutes(now());

                foreach ($transaction->details as $detail) {
                    $detail->update([
                        'status' => 'served'
                    ]);
                }
            }

            $transaction->update($updateData);

            if ($request->status === 'completed' && $transaction->user) {
                $msg = "Pesanan #TRX-{$transaction->id} sudah selesai! Silakan ambil atau tunggu pelayan mengantarkannya.";

                $transaction->user->notify(new GeneralNotification(
                    $msg,
                    'success',
                    "/profile-customer?tab=orders"
                ));
            }

            $transaction->load(['details.menu', 'table', 'user']);
            event(new NewOrderReceived($transaction));

            return response()->json([
                'status' => 'success',
                'message' => 'Status updated to ' . $request->status,
                'data' => $transaction
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 400);
        }
    }

    // public function confirmPayment(Request $request, $id)
    // {
    //     $validator = Validator::make($request->all(), [
    //         'amount_paid' => 'required|numeric|min:0',
    //     ]);

    //     if ($validator->fails()) {
    //         return response()->json(['errors' => $validator->errors()], 422);
    //     }

    //     try {
    //         Log::info("=== [CONFIRMING PAYMENT] ===");
    //         return DB::transaction(function () use ($request, $id) {
    //             $transaction = Transaction::where('status', 'pending_payment')
    //                 ->lockForUpdate()
    //                 ->findOrFail($id);
    //             Log::info("Found Pending Transaction: " . $transaction->transaction_code);

    //             $amountPaid = (float) $request->amount_paid;
    //             $totalAmount = (float) $transaction->total_amount;

    //             if ($amountPaid < $totalAmount) {
    //                 throw new Exception("Pembayaran kurang! Total: " . number_format($totalAmount));
    //             }

    //             $transaction->update([
    //                 'status' => 'cooking',
    //                 'amount_paid' => $amountPaid,
    //                 'change_amount' => $amountPaid - $totalAmount,
    //                 'paid_at' => now(),
    //                 'cashier_id' => Auth::id(),
    //             ]);

    //             Log::info("Status Updated to COOKING. Now calling Inventory Service.");

    //             $this->posService->decreaseInventory($transaction);

    //             Log::info("=== [PAYMENT CONFIRMED & STOCK UPDATED] ===");

    //             event(new PaymentConfirmed($transaction));
    //             event(new NewOrderReceived($transaction));

    //             return response()->json([
    //                 'status' => 'success',
    //                 'message' => 'Pembayaran Berhasil. Pesanan diteruskan ke Dapur.',
    //                 'data' => $transaction->load(['details.menu', 'table'])
    //             ]);
    //         });
    //     } catch (Exception $e) {
    //         Log::error("!!! [PAYMENT ERROR] !!! : " . $e->getMessage());
    //         return response()->json(['status' => 'error', 'message' => $e->getMessage()], 400);
    //     }
    // }



    public function confirmPayment(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'amount_paid' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            Log::info("=== [CONFIRMING PAYMENT] ===");

            return DB::transaction(function () use ($request, $id) {

                $transaction = Transaction::where('status', 'pending_payment')
                    ->lockForUpdate()
                    ->with('details')
                    ->findOrFail($id);

                $amountPaid = (float) $request->amount_paid;
                $totalAmount = (float) $transaction->total_amount;

                if ($amountPaid < $totalAmount) {
                    throw new Exception("Pembayaran kurang! Total: " . number_format($totalAmount));
                }

                $transaction->update([
                    'status' => 'cooking',
                    'amount_paid' => $amountPaid,
                    'change_amount' => $amountPaid - $totalAmount,
                    'paid_at' => now(),
                    'cashier_id' => Auth::id(),
                ]);

                foreach ($transaction->details as $detail) {
                    $detail->update([
                        'status' => 'cooking'
                    ]);
                }

                Log::info("Payment confirmed, dispatching job...");

                ProcessPaymentJob::dispatch($transaction->id);

                return response()->json([
                    'status' => 'success',
                    'message' => 'Pembayaran berhasil diproses',
                    'data' => $transaction->load(['details.menu', 'table'])
                ]);
            });
        } catch (Exception $e) {
            Log::error("PAYMENT ERROR: " . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function show($id)
    {
        $transaction = Transaction::with([
            'details.menu',
            'table',
            'cashier',
            'user'
        ])->find($id);

        if (!$transaction) {
            return response()->json([
                'status' => 'error',
                'message' => 'Transaksi tidak ditemukan'
            ], 404);
        }

        $subtotal = collect($transaction->details)
            ->whereNull('notes')
            ->sum('subtotal');

        $service = collect($transaction->details)
            ->where('notes', 'Service Charge')
            ->sum('subtotal');

        $tax = collect($transaction->details)
            ->where('notes', 'Tax')
            ->sum('subtotal');

        $pricing = [
            'subtotal' => (int) $subtotal,
            'service'  => (int) $service,
            'tax'      => (int) $tax,
            'total'    => (int) $transaction->total_amount,
        ];

        return response()->json([
            'status' => 'success',
            'data' => [
                ...$transaction->toArray(),
                'pricing' => $pricing
            ]
        ]);
    }

    public function userTransactions()
    {
        try {
            $userId = Auth::id();

            $transactions = Transaction::with(['details.menu', 'table'])
                ->where('user_id', $userId)
                ->orderBy('created_at', 'desc')
                ->paginate(10);

            return response()->json([
                'status' => 'success',
                'data' => $transactions
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch transactions: ' . $e->getMessage()
            ], 500);
        }
    }

    public function exportAll()
    {
        return Excel::download(new TransactionsExport, 'semua_transaksi.xlsx');
    }

    public function exportSingle($id)
    {
        $check = Transaction::find($id);
        // dd($check);
        if (!$check) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        return Excel::download(new TransactionsExport($id), "transaksi_{$id}.xlsx");
    }

    public function getSnapToken($id)
    {
        try {
            $transaction = Transaction::with(['user'])->findOrFail($id);
            $settingsRaw = Setting::first();
            $allSettings = $settingsRaw ? json_decode($settingsRaw->settings, true) : [];

            if ($transaction->snap_token) {
                return response()->json(['snap_token' => $transaction->snap_token]);
            }

            $availableMethods = $allSettings['available_methods']['value'] ?? [];
            $enabledPayments = [];

            if (is_array($availableMethods)) {
                $enabledPayments = collect($availableMethods)
                    ->filter(fn($method) => (isset($method['active']) && $method['active'] == 1))
                    ->pluck('id')
                    ->toArray();
            }

            $params = [
                'transaction_details' => [
                    'order_id' => $transaction->transaction_code . '-' . time(),
                    'gross_amount' => (int) round($transaction->total_amount),
                ],
                'customer_details' => [
                    'first_name' => $transaction->user->name ?? $transaction->customer_name ?? 'Guest',
                    'email'      => $transaction->user->email ?? 'cust@mail.com',
                ],
                'enabled_payments' => !empty($enabledPayments) ? $enabledPayments : null,
            ];

            Config::$serverKey = config('midtrans.server_key');
            Config::$isProduction = false;

            $snapToken = Snap::getSnapToken($params);

            $transaction->update(['snap_token' => $snapToken]);

            return response()->json(['snap_token' => $snapToken]);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Gagal memproses pembayaran',
                'debug'   => $e->getMessage()
            ], 500);
        }
    }
}
