<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\Table;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RoomController extends Controller
{
    public function index()
    {
        $rooms = Room::with('tables')->latest()->get();

        return response()->json([
            'data' => $rooms
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:rooms,name',
            'color' => 'nullable|string|max:20',
            'capacity' => 'nullable|string|min:1',
            'width' => 'required|integer|min:300|max:5000',
            'height' => 'required|integer|min:300|max:5000',
        ]);

        $room = Room::create($validated);

        return response()->json([
            'data' => $room
        ], 201);
    }

    public function show(Room $room)
    {
        $room->load('tables');

        return response()->json([
            'data' => $room
        ]);
    }

    public function update(Request $request, Room $room)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:rooms,name,' . $room->id,
            'color' => 'nullable|string|max:20',
            'width' => 'required|integer|min:300|max:5000',
            'capacity' => 'nullable|string|min:1',
            'height' => 'required|integer|min:300|max:5000',
        ]);

        $room->update($validated);

        return response()->json([
            'data' => $room
        ]);
    }

    public function destroy(Room $room)
    {
        DB::transaction(function () use ($room) {

            Table::where('room_id', $room->id)
                ->update([
                    'room_id' => null,
                    'x_position' => null,
                    'y_position' => null
                ]);

            $room->delete();
        });

        return response()->json([
            'message' => 'Room deleted'
        ]);
    }

    public function updateLayout(Request $request, Room $room)
    {
        $validated = $request->validate([
            'tables' => 'required|array|min:1',
            'tables.*.id' => 'required|exists:tables,id',
            'tables.*.x_position' => 'required|integer|min:0',
            'tables.*.y_position' => 'required|integer|min:0',
            'tables.*.width' => 'required|integer|min:50|max:500',
            'tables.*.height' => 'required|integer|min:50|max:500',
            'tables.*.rotation' => 'required|integer|min:0|max:360',
        ]);

        DB::transaction(function () use ($validated, $room) {

            foreach ($validated['tables'] as $tableData) {

                Table::where('id', $tableData['id'])
                    ->update([
                        'room_id' => $room->id,
                        'x_position' => $tableData['x_position'],
                        'y_position' => $tableData['y_position'],
                        'width' => $tableData['width'],
                        'height' => $tableData['height'],
                        'rotation' => $tableData['rotation'],
                    ]);
            }
        });

        return response()->json([
            'message' => 'Layout saved'
        ]);
    }

    public function availableTables()
    {
        $tables = Table::whereNull('room_id')->get();

        return response()->json([
            'data' => $tables
        ]);
    }
}
