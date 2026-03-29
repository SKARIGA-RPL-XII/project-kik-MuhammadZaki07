<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Schedule;
use App\Models\Attendance;
use App\Models\Leave;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AutoProcessAlphaAttendance extends Command
{
    protected $signature = 'attendance:process-alpha';
    protected $description = 'Proses pegawai yang tidak absen (Alpha) dan berikan sanksi strike';

    public function handle()
    {
        $today = Carbon::today()->toDateString();

        $schedules = Schedule::where('date', $today)
            ->where('is_holiday', false)
            ->whereNotNull('shift_id')
            ->get();

        foreach ($schedules as $schedule) {
            $isOnLeave = Leave::where('user_id', $schedule->user_id)
                ->where('status', 'approved')
                ->whereDate('start_date', '<=', $today)
                ->whereDate('end_date', '>=', $today)
                ->exists();

            if ($isOnLeave) {
                $this->info("User {$schedule->user_id} sedang izin resmi, skip strike.");
                continue;
            }

            $attendance = Attendance::where('schedule_id', $schedule->id)->first();

            if (!$attendance || is_null($attendance->clock_in)) {
                DB::transaction(function () use ($schedule) {
                    Attendance::updateOrCreate(
                        ['schedule_id' => $schedule->id],
                        [
                            'user_id' => $schedule->user_id,
                            'date' => $schedule->date,
                            'status' => 'alpha'
                        ]
                    );

                    $user = User::find($schedule->user_id);
                    $user->increment('strike_count');

                    if ($user->strike_count >= 3) {
                        $user->update(['is_active' => false]);
                        $this->warn("User {$user->name} OTOMATIS DIBLOKIR (3 Strike).");
                    }
                });
            }
        }

        $this->info('Proses pengecekan Alpha selesai.');
    }
}
