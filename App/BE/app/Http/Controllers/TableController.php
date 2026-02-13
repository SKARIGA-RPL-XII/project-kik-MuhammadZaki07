<?php

namespace App\Http\Controllers;

use App\Models\Table;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use BaconQrCode\Writer;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Renderer\Image\GdImageBackEnd;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class TableController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');
        $status = $request->query('status');
        $page = max(1, (int) $request->query('page', 1));
        $size = (int) $request->query('size', 10);

        $query = Table::query()
            ->when($search, function ($q) use ($search) {
                $q->where('table_number', 'like', "%{$search}%");
            })
            ->when($status, function ($q) use ($status) {
                $q->where('status', $status);
            });

        $total = $query->count();

        $data = $query
            ->latest()
            ->skip(($page - 1) * $size)
            ->take($size)
            ->get();

        return response()->json([
            "message" => "success get tables",
            "data" => [
                "tables" => $data,
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
    $request->validate([
        'table_number' => 'required|string|unique:tables,table_number',
    ]);

    $table = Table::create([
        'table_number' => $request->table_number,
        'status' => 'available',
        'qr_code' => null
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

    public function update(Request $request, Table $table)
    {
        $request->validate([
            'table_number' => 'sometimes|string|unique:tables,table_number,' . $table->id,
            'status' => 'sometimes|in:available,occupied'
        ]);

        $table->update($request->only(['table_number', 'status']));

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
