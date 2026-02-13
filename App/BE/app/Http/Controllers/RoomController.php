<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\Table;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $rooms = Room::with('tables')->get();
        return response()->json(['data' => $rooms]);
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
        $request->validate([
            'name' => 'required|unique:rooms,name',
            'capacity' => 'required|integer|min:1',
            'table_ids' => 'required|array|min:1',
        ]);

        if (count($request->table_ids) > $request->capacity) {
            return response()->json(['message' => 'Too many tables'], 422);
        }

        $usedTables = Table::whereIn('id', $request->table_ids)
            ->whereNotNull('room_id')
            ->exists();

        if ($usedTables) {
            return response()->json([
                'message' => 'One or more tables already assigned to another room'
            ], 422);
        }

        $room = Room::create($request->only(['name', 'capacity']));

        Table::whereIn('id', $request->table_ids)
            ->update(['room_id' => $room->id]);

        return response()->json(['data' => $room->load('tables')]);
    }


    /**
     * Display the specified resource.
     */
    public function show(Room $room)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Room $room)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Room $room)
    {
        $request->validate([
            'name' => 'required|unique:rooms,name,' . $room->id,
            'capacity' => 'required|integer|min:1',
            'table_ids' => 'sometimes|array',
        ]);

        $room->update($request->only(['name', 'capacity']));

        if ($request->has('table_ids')) {
            if (count($request->table_ids) > $room->capacity) {
                return response()->json(['message' => 'Too many tables'], 422);
            }

            $conflict = Table::whereIn('id', $request->table_ids)
                ->whereNotNull('room_id')
                ->where('room_id', '!=', $room->id)
                ->exists();

            if ($conflict) {
                return response()->json([
                    'message' => 'Some tables already belong to another room'
                ], 422);
            }

            Table::where('room_id', $room->id)->update(['room_id' => null]);
            Table::whereIn('id', $request->table_ids)
                ->update(['room_id' => $room->id]);
        }

        return response()->json(['data' => $room->load('tables')]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Room $room)
    {
        Table::where('room_id', $room->id)->update(['room_id' => null]);
        $room->delete();

        return response()->json(['message' => 'Room deleted']);
    }
}
