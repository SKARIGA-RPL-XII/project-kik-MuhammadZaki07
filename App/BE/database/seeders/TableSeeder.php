<?php

namespace Database\Seeders;

use App\Models\Table;
use App\Models\Room;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class TableSeeder extends Seeder
{
public function run(): void
{
    DB::table('tables')->truncate();
    Storage::disk('public')->makeDirectory('qrcodes');

    $rooms = Room::all();
    $tableNumber = 1;

    foreach ($rooms as $room) {
        $cols = ceil(sqrt($room->capacity));
        $spacingX = 180;
        $spacingY = 180;
        $startX = 100;
        $startY = 100;

        for ($i = 0; $i < $room->capacity; $i++) {
            $col = $i % $cols;
            $row = floor($i / $cols);
            $x = $startX + ($col * $spacingX);
            $y = $startY + ($row * $spacingY);
            $status = 'available';
            $reservedUntil = null;
            $lastServiceAt = null;

            if ($i === 0) {
                $status = 'occupied';
                $lastServiceAt = now()->subMinutes(rand(10, 120));
            } elseif ($i === 1) {
                $status = 'reserved';
                $reservedUntil = now()->addHours(rand(1, 4));
            }

            $table = Table::create([
                'table_number' => (string) $tableNumber,
                'status' => $status,
                'reserved_until' => $reservedUntil,
                'last_service_at' => $lastServiceAt,
                'room_id' => $room->id,
                'x_position' => $x,
                'y_position' => $y,
                'width' => 100,
                'height' => 100,
                'rotation' => 0,
                'notes' => $status === 'reserved' ? 'Booking via WhatsApp' : null
            ]);

            $fileName = "qrcodes/table_{$table->id}.svg";
            $qr = QrCode::format('svg')
                ->size(300)
                ->generate(env('FRONTEND_URL') . "/order/{$table->id}");

            Storage::disk('public')->put($fileName, $qr);

            $table->update([
                'qr_code' => $fileName
            ]);
            $tableNumber++;
        }
    }

    for ($i = 0; $i < 5; $i++) {
        $table = Table::create([
            'table_number' => (string) $tableNumber,
            'status' => 'available',
            'reserved_until' => null,
            'last_service_at' => null,
            'room_id' => null,
            'x_position' => null,
            'y_position' => null,
            'width' => 100,
            'height' => 100,
            'rotation' => 0,
            'notes' => null
        ]);

        $fileName = "qrcodes/table_{$table->id}.svg";
        $qr = QrCode::format('svg')
            ->size(300)
            ->generate(env('FRONTEND_URL') . "/order/{$table->id}");

        Storage::disk('public')->put($fileName, $qr);

        $table->update([
            'qr_code' => $fileName
        ]);
        $tableNumber++;
    }
}
}
