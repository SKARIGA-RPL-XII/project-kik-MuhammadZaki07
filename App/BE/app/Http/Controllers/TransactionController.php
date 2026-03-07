<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\PosService;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
        $query = Transaction::with(['table', 'details.menu.attributes.levels'])
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
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Database error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_source' => 'required|in:qr_code,cashier_direct',
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
        } catch (\Exception $e) {
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
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 400);
        }
    }
}
