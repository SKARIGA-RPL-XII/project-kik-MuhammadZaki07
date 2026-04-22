<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Stock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class StockController extends Controller
{
    public function index(Request $request)
    {
        $page = max(0, (int) $request->query('page', 0));
        $size = max(1, (int) $request->query('size', 10));

        $query = Stock::with(['unit', 'supplier']);

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $total = $query->count();

        $data = $query->latest()
            ->skip($page * $size)
            ->take($size)
            ->get();

        return response()->json([
            'status' => 'success',
            'message' => 'success get stocks',
            'data' => $data,
            'metadata' => [
                'page' => $page,
                'size' => $size,
                'total' => $total
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'                => 'required|string',
            'unit_id'             => 'required|exists:units,id',
            'quantity'            => 'required|numeric|min:0',
            'low_stock_threshold' => 'required|numeric|min:0',
            'supplier_id'         => 'nullable|exists:suppliers,id',
        ]);

        return DB::transaction(function () use ($validated) {
            $stock = Stock::where('name', $validated['name'])
                ->where('unit_id', $validated['unit_id'])
                ->where('supplier_id', $validated['supplier_id'])
                ->first();

            if ($stock) {
                // Jika ADA: Tambah quantity-nya saja
                $stock->increment('quantity', $validated['quantity']);
                $stock->update(['low_stock_threshold' => $validated['low_stock_threshold']]);
                $reason = 'Additional stock entry';
            } else {
                $stock = Stock::create($validated);
                $reason = 'Initial stock entry';
            }

            $stock->adjustments()->create([
                'type'    => 'in',
                'amount'  => $validated['quantity'],
                'reason'  => $reason,
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'status' => 'success',
                'message' => $stock->wasRecentlyCreated ? 'Stock created' : 'Stock updated',
                'data' => $stock->load(['unit', 'supplier'])
            ]);
        });
    }

    public function update(Request $request, Stock $stock)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $stock->update($validated);

        return response()->json($stock->load(['unit', 'supplier']));
    }

    public function destroy(Stock $stock)
    {
        return DB::transaction(function () use ($stock) {
            $stock->adjustments()->create([
                'type' => 'out',
                'amount' => $stock->quantity,
                'reason' => 'Item deleted from inventory',
                'user_id' => Auth::id(),
            ]);

            $stock->delete();

            return response()->json(['message' => 'Stock deleted and movement recorded']);
        });
    }
}
