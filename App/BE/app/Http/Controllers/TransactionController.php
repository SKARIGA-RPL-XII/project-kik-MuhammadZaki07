<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\PosService;
use App\Models\Transaction;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

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
            'created_at'
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

            if ($transaction->status === 'paid') {
                return response()->json([
                    'success' => false,
                    'message' => 'This order has already been paid.'
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
            $transaction->load(['details.menu']);

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
            $transaction->update(['status' => $request->status]);

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

    public function confirmPayment(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'amount_paid' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            return DB::transaction(function () use ($request, $id) {
                $transaction = Transaction::where('status', 'pending_payment')->lockForUpdate()->findOrFail($id);

                $amountPaid = (float) $request->amount_paid;
                $totalAmount = (float) $transaction->total_amount;

                if ($amountPaid < $totalAmount) {
                    throw new Exception("Payment insufficient. Total: " . number_format($totalAmount));
                }

                $transaction->update([
                    'status' => 'paid',
                    'amount_paid' => $amountPaid,
                    'change_amount' => $amountPaid - $totalAmount,
                    'paid_at' => now(),
                    'cashier_id' => Auth::id(),
                ]);

                $this->posService->decreaseInventory($transaction);

                broadcast(new \App\Events\PaymentConfirmed($transaction))->toOthers();

                return response()->json([
                    'status' => 'success',
                    'message' => 'Payment confirmed successfully',
                    'data' => $transaction->load('details.menu')
                ]);
            });
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function show($id)
    {
        $transaction = Transaction::with(['details.menu', 'table'])->find($id);

        if (!$transaction) {
            return response()->json([
                'status' => 'error',
                'message' => 'Transaksi tidak ditemukan'
            ], 404);
        }


        return response()->json([
            'status' => 'success',
            'data' => $transaction
        ]);
    }

    public function userTransactions()
    {
        try {
            $userId = Auth::id();

            $transactions = Transaction::with(['details.menu', 'table'])
                ->where('user_id', $userId)
                ->orderBy('created_at', 'desc')
                ->get();

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
}
