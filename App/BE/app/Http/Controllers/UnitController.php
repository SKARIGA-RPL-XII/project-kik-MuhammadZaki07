<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use Illuminate\Http\Request;

class UnitController extends Controller
{
    public function index(Request $request)
    {
        $query = Unit::with('baseUnit');

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                ->orWhere('abbreviation', 'like', '%' . $request->search . '%');
        }

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        $size = $request->input('size', 10);
        $units = $query->paginate($size);

        return response()->json([
            'success' => true,
            'data' => [
                'units' => $units->items(),
                'metadata' => [
                    'page' => $units->currentPage(),
                    'size' => $units->perPage(),
                    'total' => $units->total(),
                ]
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'abbreviation' => 'required|string',
            'category' => 'required|in:weight,volume,unit',
            'base_unit_id' => 'nullable|exists:units,id',
            'multiplier' => 'required|numeric|min:0',
        ]);

        if (empty($validated['base_unit_id'])) {
            $unit = Unit::create(array_merge($validated, ['multiplier' => 1]));
            $unit->update(['base_unit_id' => $unit->id]);
        } else {
            $baseUnit = Unit::find($validated['base_unit_id']);
            if ($baseUnit->category !== $validated['category']) {
                return response()->json(['message' => 'Kategori unit harus sama dengan Base Unit'], 422);
            }
            $unit = Unit::create($validated);
        }

        return response()->json($unit);
    }

    public function update(Request $request, Unit $unit)
    {
        $validated = $request->validate([
            'name' => 'string',
            'abbreviation' => 'string',
            'multiplier' => 'numeric|min:0',
        ]);

        if ($unit->isBase()) {
            unset($validated['multiplier']);
        }

        $unit->update($validated);
        return response()->json($unit);
    }

    public function destroy(Unit $unit)
    {
        if ($unit->isBase() && $unit->childUnits()->count() > 1) {
            return response()->json(['message' => 'Tidak bisa menghapus Base Unit yang masih memiliki unit turunan'], 422);
        }

        $unit->delete();
        return response()->json(['message' => 'Unit berhasil dihapus']);
    }
}
