<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Shift;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ShiftController extends Controller
{
    public function index()
    {
        $shifts = Shift::all();
        return response()->json([
            'success' => true,
            'data' => $shifts
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i',
            'late_tolerance' => 'nullable|integer',
            'late_penalty' => 'nullable|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $shift = Shift::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Shift created successfully',
            'data' => $shift
        ], 201);
    }

    public function show(Shift $shift)
    {
        return response()->json([
            'success' => true,
            'data' => $shift
        ]);
    }

    public function update(Request $request, Shift $shift)
    {
        $shift->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Shift updated successfully',
            'data' => $shift
        ]);
    }

    public function destroy(Shift $shift)
    {
        $shift->delete();
        return response()->json([
            'success' => true,
            'message' => 'Shift deleted successfully'
        ]);
    }
}
