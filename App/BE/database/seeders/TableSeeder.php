<?php

namespace Database\Seeders;

use App\Models\Table;
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

        for ($i = 1; $i <= 50; $i++) {
            $table = Table::create([
                'table_number' => (string) $i,
                'status' => 'available',
                'qr_code' => null,
                'room_id' => null,
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
        }
    }
}
