<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TransactionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'table_id' => 'required|exists:tables,id',
            'payment_method' => 'nullable|in:cash,ewallet',
            'items' => 'required|array|min:1',
            'items.*.menu_id' => 'required|exists:menus,id',
            'items.*.qty' => 'required|integer|min:1',
        ]);

        return DB::transaction(function () use ($request, $validated) {
            $totalAmount = 0;

            $menus = Menu::whereIn(
                'id',
                collect($validated['items'])->pluck('menu_id')
            )->lockForUpdate()->get()->keyBy('id');

            foreach ($validated['items'] as $item) {
                $menu = $menus[$item['menu_id']];

                if ($menu->stock < $item['qty']) {
                    throw ValidationException::withMessages([
                        'stock' => "Stock menu {$menu->name} tidak cukup"
                    ]);
                }

                $totalAmount += $menu->price * $item['qty'];
            }

            $transaction = Transaction::create([
                'table_id' => $validated['table_id'],
                'user_id' => auth()->id(),
                'status' => 'pending_payment',
                'total_amount' => $totalAmount,
                'payment_method' => $validated['payment_method'],
                'transaction_date' => now(),
            ]);

            foreach ($validated['items'] as $item) {
                $menu = $menus[$item['menu_id']];
                $subtotal = $menu->price * $item['qty'];

                TransactionDetail::create([
                    'transaction_id' => $transaction->id,
                    'menu_id' => $menu->id,
                    'menu_qty' => $item['qty'],
                    'price' => $menu->price,
                    'subtotal' => $subtotal,
                ]);

                $menu->decrement('stock', $item['qty']);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Transaction created',
                'data' => $transaction->load('details.menu')
            ], 201);
        });
    }


    /**
     * Display the specified resource.
     */
    public function show(Transaction $transaction)
    {
        return response()->json([
            'status' => 'success',
            'data' => $transaction->load('details.menu', 'table')
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Transaction $transaction)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Transaction $transaction)
    {
        $validated = $request->validate([
            'amount_paid' => 'required|integer|min:' . $transaction->total_amount,
        ]);

        if ($transaction->status !== 'pending_payment') {
            return response()->json([
                'message' => 'Transaction already processed'
            ], 400);
        }

        $change = $validated['amount_paid'] - $transaction->total_amount;

        $transaction->update([
            'status' => 'paid',
            'amount_paid' => $validated['amount_paid'],
            'change_amount' => $change,
            'paid_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Payment success',
            'data' => $transaction
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Transaction $transaction)
    {
        //
    }
}
