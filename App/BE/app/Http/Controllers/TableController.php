<?php

namespace App\Http\Controllers;

use App\Models\Table;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class TableController extends Controller
{

    public function index(Request $request)
    {
        $search = $request->query('search');
        $status = $request->query('status');
        $roomId = $request->query('room_id');
        $available = $request->query('available');

        $page = max(1, (int) $request->query('page', 1));
        $size = (int) $request->query('size', 10);

        $query = Table::with('room')

            ->when(
                $search,
                fn($q) =>
                $q->where('table_number', 'like', "%{$search}%")
            )

            ->when(
                $status,
                fn($q) =>
                $q->where('status', $status)
            )

            ->when(
                $roomId,
                fn($q) =>
                $q->where('room_id', $roomId)
            )

            ->when(
                $available,
                fn($q) =>
                $q->whereNull('room_id')
            );


        $total = $query->count();

        $tables = $query
            ->latest()
            ->skip(($page - 1) * $size)
            ->take($size)
            ->get();


        return response()->json([

            "message" => "success get tables",
            "data" => [
                "tables" => $tables,
                "metadata" => [
                    "page" => $page,
                    "size" => $size,
                    "total" => $total
                ]
            ]
        ]);
    }

    public function store(Request $request)
    {

        $validated = $request->validate([
            'table_number' => 'required|string|max:50|unique:tables'
        ]);


        $table = Table::create([

            'table_number' => $validated['table_number'],
            'status' => 'available',
            'qr_code' => null,
            'room_id' => null,
            'x_position' => null,
            'y_position' => null,
            'width' => 100,
            'height' => 100,
            'rotation' => 0
        ]);


        $qrUrl = env('FRONTEND_URL') . "/order/{$table->id}";
        $fileName = "qrcodes/table_{$table->id}.svg";

        $qr = QrCode::format('svg')
            ->size(300)
            ->generate($qrUrl);

        Storage::disk('public')->put($fileName, $qr);

        $table->update([
            'qr_code' => $fileName
        ]);


        return response()->json([
            "message" => "success create table",
            "data" => $table
        ], 201);
    }   

    public function show(Table $table)
    {

        $table->load('room');

        return response()->json([
            "data" => $table
        ]);
    }

    public function update(Request $request, Table $table)
    {

        $validated = $request->validate([
            'table_number' => 'sometimes|string|max:50|unique:tables,table_number,' . $table->id,
            'status' => 'sometimes|in:available,occupied',
            'room_id' => 'nullable|exists:rooms,id',
            'x_position' => 'nullable|integer|min:0',
            'y_position' => 'nullable|integer|min:0',
            'width' => 'nullable|integer|min:50|max:500',
            'height' => 'nullable|integer|min:50|max:500',
            'rotation' => 'nullable|integer|min:0|max:360'
        ]);

        $table->update($validated);

        return response()->json([
            "message" => "success update table",
            "data" => $table
        ]);
    }

    public function destroy(Table $table)
    {
        if ($table->qr_code) {
            Storage::disk('public')->delete($table->qr_code);
        }

        $table->delete();
        return response()->json([
            "message" => "success delete table"
        ]);
    }
}
