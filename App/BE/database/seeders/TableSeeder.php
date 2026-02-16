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
            $spacingX = 140;
            $spacingY = 140;
            $startX = 80;
            $startY = 80;
            for ($i = 0; $i < $room->capacity; $i++) {
                $col = $i % $cols;
                $row = floor($i / $cols);
                $x = $startX + ($col * $spacingX);
                $y = $startY + ($row * $spacingY);

                $table = Table::create([
                    'table_number' => (string) $tableNumber,
                    'status' => 'available',
                    'room_id' => $room->id,
                    'x_position' => $x,
                    'y_position' => $y,
                    'width' => 100,
                    'height' => 100,
                    'rotation' => 0
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
                'room_id' => null,
                'x_position' => null,
                'y_position' => null,
                'width' => 100,
                'height' => 100,
                'rotation' => 0
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
