<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Stock;
use Illuminate\Http\Request;

class StockController extends Controller
{
    public function index(Request $request)
    {
        $page = max(0, (int) $request->query('page', 0));
        $size = max(1, (int) $request->query('size', 10));

        $query = Stock::query();

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
            'name' => 'required|string',
            'unit' => 'required|string',
            'quantity' => 'required|integer',
            'low_stock_threshold' => 'required|integer',
        ]);

        $stock = Stock::create($validated);
        return response()->json($stock);
    }

    public function update(Request $request, Stock $stock)
    {
        $validated = $request->validate([
            'name' => 'string',
            'unit' => 'string',
            'quantity' => 'integer',
            'low_stock_threshold' => 'integer',
        ]);

        $stock->update($validated);
        return response()->json($stock);
    }

    public function destroy(Stock $stock)
    {
        $stock->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
