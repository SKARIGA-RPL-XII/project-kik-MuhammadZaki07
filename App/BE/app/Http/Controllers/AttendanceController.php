<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class AttendanceController extends Controller
{
    private $officeLat = -7.929242549769063;
    private $officeLong = 112.59065530363672;
    private $maxDistance = 50;

    public function clockIn(Request $request)
    {
        $user = Auth::user();
        $now = Carbon::now();
        $today = $now->toDateString();

        $schedule = Schedule::with('shift')
            ->where('user_id', $user->id)
            ->where('date', $today)
            ->first();

        if (!$schedule || $schedule->is_holiday) {
            return response()->json(['message' => 'Tidak ada jadwal kerja hari ini.'], 403);
        }

        $attendance = Attendance::where('user_id', $user->id)
            ->where('date', $today)
            ->whereNotNull('clock_in')
            ->first();

        if ($attendance && $attendance->clock_in) {
            return response()->json(['message' => 'Kamu sudah absen masuk hari ini.'], 400);
        }

        $distance = $this->calculateDistance(
            $request->lat,
            $request->long,
            $this->officeLat,
            $this->officeLong
        );

        if ($distance > $this->maxDistance) {
            return response()->json(['message' => 'Kamu berada di luar jangkauan kantor (' . round($distance) . 'm).'], 403);
        }

        $startTime = Carbon::createFromFormat('H:i:s', $schedule->shift->start_time);
        $lateMinutes = $now->diffInMinutes($startTime, false);

        $status = 'present';
        $penalty = 0;

        if ($lateMinutes < -$schedule->shift->late_tolerance) {
            $status = 'late';
            $absLate = abs($lateMinutes);
            $penalty = $absLate * $schedule->shift->late_penalty;
        }

        $attendance = Attendance::updateOrCreate(
            ['user_id' => $user->id, 'schedule_id' => $schedule->id, 'date' => $today],
            [
                'clock_in' => $now->toTimeString(),
                'lat_in' => $request->lat,
                'long_in' => $request->long,
                'status' => $status,
                'total_penalty' => $penalty
            ]
        );

        return response()->json([
            'success' => true,
            'message' => $status == 'late' ? 'Absen berhasil (Terlambat ' . abs($lateMinutes) . ' menit)' : 'Absen berhasil tepat waktu',
            'data' => $attendance
        ]);
    }

    public function clockOut(Request $request)
    {
        $user = Auth::user();
        $now = Carbon::now();
        $today = $now->toDateString();

        $attendance = Attendance::where('user_id', $user->id)
            ->where('date', $today)
            ->first();

        if (!$attendance || !$attendance->clock_in) {
            return response()->json(['message' => 'Kamu belum absen masuk.'], 400);
        }

        $attendance->update([
            'clock_out' => $now->toTimeString()
        ]);

        return response()->json(['success' => true, 'message' => 'Berhasil absen pulang. Hati-hati di jalan!']);
    }

    public function statusToday()
    {
        $user = Auth::user();
        $today = now()->toDateString();

        $attendance = Attendance::where('user_id', $user->id)
            ->where('date', $today)
            ->first();

        return response()->json([
            'success' => true,
            'attendance' => $attendance,
            'has_clock_in' => $attendance && $attendance->clock_in ? true : false,
            'has_clock_out' => $attendance && $attendance->clock_out ? true : false,
        ]);
    }

    private function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371000;
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        $a = sin($dLat / 2) * sin($dLat / 2) + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon / 2) * sin($dLon / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        return $earthRadius * $c;
    }
}
