<?php

namespace App\Http\Controllers;

use App\Models\DutySchedule;
use Illuminate\Http\Request;

class DutyScheduleController extends Controller
{
    public function index(Request $request)
    {
        $data = DutySchedule::with(['user', 'shift'])
            ->when($request->date, function ($q) use ($request) {
                $q->where('date', $request->date);
            })
            ->latest()
            ->paginate(10);

        return response()->json([
            'status' => true,
            'message' => 'Success get schedules',
            'data' => $data
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'shift_id' => ['required', 'exists:shifts,id'],
            'date' => ['required', 'date', 'after_or_equal:today'],
        ]);

        // cek manual double schedule
        $existsUser = DutySchedule::where('user_id', $validated['user_id'])
            ->where('date', $validated['date'])
            ->exists();

        if ($existsUser) {
            return response()->json([
                'status' => false,
                'message' => 'User already has schedule on this date'
            ], 422);
        }

        $existsShift = DutySchedule::where('shift_id', $validated['shift_id'])
            ->where('date', $validated['date'])
            ->exists();

        if ($existsShift) {
            return response()->json([
                'status' => false,
                'message' => 'Shift already taken on this date'
            ], 422);
        }

        $schedule = DutySchedule::create($validated);

        return response()->json([
            'status' => true,
            'message' => 'Schedule created successfully',
            'data' => $schedule->load(['user', 'shift'])
        ], 201);
    }

    public function show($id)
    {
        $schedule = DutySchedule::with(['user', 'shift'])->findOrFail($id);

        return response()->json([
            'status' => true,
            'data' => $schedule
        ]);
    }

    public function update(Request $request, $id)
    {
        $schedule = DutySchedule::findOrFail($id);

        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'shift_id' => ['required', 'exists:shifts,id'],
            'date' => ['required', 'date'],
        ]);

        // cek duplicate kecuali diri sendiri
        $existsUser = DutySchedule::where('user_id', $validated['user_id'])
            ->where('date', $validated['date'])
            ->where('id', '!=', $id)
            ->exists();

        if ($existsUser) {
            return response()->json([
                'status' => false,
                'message' => 'User already has schedule on this date'
            ], 422);
        }

        $existsShift = DutySchedule::where('shift_id', $validated['shift_id'])
            ->where('date', $validated['date'])
            ->where('id', '!=', $id)
            ->exists();

        if ($existsShift) {
            return response()->json([
                'status' => false,
                'message' => 'Shift already taken on this date'
            ], 422);
        }

        $schedule->update($validated);

        return response()->json([
            'status' => true,
            'message' => 'Schedule updated successfully',
            'data' => $schedule->load(['user', 'shift'])
        ]);
    }

    public function destroy($id)
    {
        $schedule = DutySchedule::findOrFail($id);
        $schedule->delete();

        return response()->json([
            'status' => true,
            'message' => 'Schedule deleted successfully'
        ]);
    }
}
