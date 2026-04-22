<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Room;
use App\Models\Table;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class TableController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');
        $roomId = $request->query('room_id');
        $available = $request->query('available');

        $page = max(1, (int) $request->query('page', 1));
        $size = (int) $request->query('size', 1000);

        $now = now();

        $query = Table::with(['room', 'bookings.user'])
            ->when(
                $search,
                fn($q) =>
                $q->where('table_number', 'like', "%{$search}%")
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

        $tables = $query->latest()
            ->skip(($page - 1) * $size)
            ->take($size)
            ->get();

        // Log::info('TABLE INDEX HIT', [
        //     'search' => $search,
        //     'room_id' => $roomId,
        //     'available' => $available,
        //     'page' => $page,
        //     'size' => $size,
        // ]);

        $tables->transform(function ($table) {

            $now = now();

            $bookings = Booking::with('user')
                ->where('table_id', $table->id)
                ->whereIn('status', ['confirmed', 'pending_confirmation'])
                ->get();

            $active = null;
            $todayUpcoming = null;

            foreach ($bookings as $b) {

                if ($b->booking_time <= $now && $b->end_time >= $now) {
                    $active = $b;
                    break;
                }

                if (
                    !$active &&
                    $b->booking_time->isToday() &&
                    $b->booking_time > $now
                ) {
                    $todayUpcoming = $todayUpcoming ?? $b;
                }
            }

            $table->ui_status = 'available';
            $table->reserved_until = null;
            $table->reserved_by = null;

            if ($active) {
                $table->ui_status = 'occupied';
                $table->reserved_until = $active->end_time;
                $table->reserved_by = $active->user?->username;
            } elseif ($todayUpcoming) {
                $table->ui_status = 'upcoming';
                $table->reserved_until = $todayUpcoming->booking_time;
                $table->reserved_by = $todayUpcoming->user?->username;
            }

            return $table;
        });

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
            'table_number' => 'required|string|max:50|unique:tables',
            'capacity' => 'nullable|integer',
            'room_id' => 'nullable|exists:rooms,id'
        ]);

        $room = isset($validated['room_id'])
            ? Room::find($validated['room_id'])
            : Room::withCount('tables')
            ->orderBy('tables_count', 'asc')
            ->latest()
            ->first();

        if (!$room) {
            return response()->json([
                "message" => "No room available"
            ], 400);
        }

        $spacing = 120;
        $maxPerRow = 5;

        $count = Table::where('room_id', $room->id)->count();

        $x = ($count % $maxPerRow) * $spacing;
        $y = floor($count / $maxPerRow) * $spacing;

        $table = Table::create([
            'table_number' => $validated['table_number'],
            'status' => 'available',
            'room_id' => $room->id,
            'capacity' => $validated['capacity'] ?? 4,
            'qr_code' => null,
            'x_position' => $x,
            'y_position' => $y,
            'width' => 100,
            'height' => 100,
            'rotation' => 0,
            'reserved_until' => null,
            'last_service_at' => null,
            'notes' => null
        ]);

        $qrUrl = env('FRONTEND_URL') . "/?table={$table->id}";
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
        return response()->json(["data" => $table]);
    }

    public function update(Request $request, Table $table)
    {
        $validated = $request->validate([
            'table_number' => 'sometimes|string|max:50|unique:tables,table_number,' . $table->id,
            'status' => 'sometimes|in:available,occupied,reserved',
            'room_id' => 'nullable|exists:rooms,id',
            'x_position' => 'nullable|integer',
            'y_position' => 'nullable|integer',
            'width' => 'nullable|integer|min:50|max:500',
            'height' => 'nullable|integer|min:50|max:500',
            'rotation' => 'nullable|integer|max:360',
            'reserved_until' => 'nullable|date_format:Y-m-d H:i:s',
            'notes' => 'nullable|string',
            'capacity' => "nullable|integer"
        ]);

        if (isset($validated['status'])) {
            if ($validated['status'] === 'occupied') {
                $validated['last_service_at'] = now();
                $validated['reserved_until'] = null;
            } elseif ($validated['status'] === 'available') {
                $validated['last_service_at'] = null;
                $validated['reserved_until'] = null;
            }
        }

        $table->update($validated);

        return response()->json([
            "message" => "success update table",
            "data" => $table->load('room')
        ]);
    }

    public function destroy(Table $table)
    {
        if ($table->qr_code) {
            Storage::disk('public')->delete($table->qr_code);
        }
        $table->delete();
        return response()->json(["message" => "success delete table"]);
    }
}
