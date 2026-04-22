<?php

namespace App\Http\Controllers;

use App\Models\Stock;
use App\Models\StockAdjustment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StockAdjustmentController extends Controller
{
    public function index(Request $request)
    {
        $page = max(0, (int) $request->query('page', 0));
        $size = max(1, (int) $request->query('size', 10));

       $query = StockAdjustment::with(['stock.unit', 'user']);  

        if ($request->filled('search')) {
            $query->whereHas('stock', function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $total = $query->count();
        $data = $query->latest()
            ->skip($page * $size)
            ->take($size)
            ->get();

        return response()->json([
            'status' => 'success',
            'message' => 'success get adjustments',
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
        $request->validate([
            'stock_id' => 'required|exists:stocks,id',
            'type' => 'required|in:in,out',
            'amount' => 'required|integer|min:1',
            'reason' => 'required|string'
        ]);

        return DB::transaction(function () use ($request) {
            $adjustment = StockAdjustment::create([
                'stock_id' => $request->stock_id,
                'type' => $request->type,
                'amount' => $request->amount,
                'reason' => $request->reason,
                'user_id' => auth()->id()
            ]);

            $stock = Stock::find($request->stock_id);
            if ($request->type === 'in') {
                $stock->increment('quantity', $request->amount);
            } else {
                if ($stock->quantity < $request->amount) {
                    throw new \Exception("Insufficient stock quantity.");
                }
                $stock->decrement('quantity', $request->amount);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Adjustment recorded successfully',
                'data' => $adjustment->load(['stock', 'user'])
            ]);
        });
    }

    public function show($id)
    {
        $adjustment = StockAdjustment::with(['stock', 'user'])->find($id);

        if (!$adjustment) {
            return response()->json(['status' => 'error', 'message' => 'Not found'], 404);
        }

        return response()->json(['status' => 'success', 'data' => $adjustment]);
    }

    public function destroy($id)
    {
        return DB::transaction(function () use ($id) {
            $adjustment = StockAdjustment::findOrFail($id);
            $stock = Stock::findOrFail($adjustment->stock_id);

            if ($adjustment->type === 'in') {
                $stock->decrement('quantity', $adjustment->amount);
            } else {
                $stock->increment('quantity', $adjustment->amount);
            }

            $adjustment->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Adjustment voided and stock restored'
            ]);
        });
    }
}
