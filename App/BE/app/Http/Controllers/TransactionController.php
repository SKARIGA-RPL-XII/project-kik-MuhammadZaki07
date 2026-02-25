<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\PosService;
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

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_source' => 'required|in:qr_code,cashier_direct',
            'order_type' => 'required|in:dine_in,take_away',
            'table_id' => 'required_if:order_type,dine_in|exists:tables,id',
            'payment_method' => 'required|in:cash,midtrans',
            'items' => 'required|array|min:1',
            'items.*.menu_id' => 'required|exists:menus,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.attributes' => 'nullable|array',
            'items.*.attributes.*' => 'exists:attribute_levels,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $cashierId = Auth::check() && (Auth::user()->role->role_name || Auth::user()->role->role_name) === 'cashier' ? Auth::user()->id : null;

            $transaction = $this->posService->execute($request->all(), $cashierId);

            return response()->json([
                'status' => 'success',
                'message' => 'Transaction created successfully',
                'data' => $transaction->load('details.menu')
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 400);
        }
    }
}
