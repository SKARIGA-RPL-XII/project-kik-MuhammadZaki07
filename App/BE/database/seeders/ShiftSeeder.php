<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ShiftSeeder extends Seeder
{
    public function run(): void
    {
        $shifts = [
            [
                'id' => 1,
                'name' => 'pagi',
                'start_time' => '07:00:00',
                'end_time' => '14:00:00',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'id' => 2,
                'name' => 'siang',
                'start_time' => '14:15:00',
                'end_time' => '21:00:00',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'id' => 3,
                'name' => 'malam',
                'start_time' => '21:00:00',
                'end_time' => '07:00:00',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'id' => 4,
                'name' => 'full time',
                'start_time' => '07:00:00',
                'end_time' => '21:00:00',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ];

        DB::table('shifts')->insert($shifts);
    }
}
