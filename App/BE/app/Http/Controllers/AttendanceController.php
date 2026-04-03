<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use App\Exports\AttendanceExport;
use App\Notifications\GeneralNotification;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Maatwebsite\Excel\Facades\Excel;

class AttendanceController extends Controller
{
    private $officeLat = -7.929135494953358;
    private $officeLong = 112.58941654232895;
    private $maxDistance = 500;

    public function myAttendance(Request $request)
    {
        $user = Auth::user();
        $query = Attendance::with(['schedule.shift'])
            ->where('user_id', $user->id);

        if ($request->has('month')) {
            $date = Carbon::parse($request->month);
            $query->whereMonth('date', $date->month)
                ->whereYear('date', $date->year);
        }

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $attendances = $query->latest('date')
            ->paginate($request->get('per_page', 10));

        $summary = [
            'total_present' => (clone $query)->whereIn('status', ['present', 'late'])->count(),
            'total_alpha' => (clone $query)->where('status', 'alpha')->count(),
            'total_penalty' => (clone $query)->sum('total_penalty'),
        ];

        return response()->json([
            'success' => true,
            'data' => $attendances->items(),
            'summary' => $summary,
            'meta' => [
                'current_page' => $attendances->currentPage(),
                'last_page' => $attendances->lastPage(),
                'total' => $attendances->total(),
            ]
        ]);
    }

    public function index(Request $request)
    {
        $query = Attendance::with(['user', 'schedule.shift']);

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('date')) {
            $query->whereDate('date', $request->date);
        }

        if ($request->has('month')) {
            $query->whereMonth('date', Carbon::parse($request->month)->month)
                ->whereYear('date', Carbon::parse($request->month)->year);
        }

        $attendances = $query->latest('date')
            ->paginate($request->get('per_page', 10));

        return response()->json([
            'success' => true,
            'data' => $attendances->items(),
            'meta' => [
                'current_page' => $attendances->currentPage(),
                'last_page' => $attendances->lastPage(),
                'total' => $attendances->total(),
            ]
        ]);
    }

    public function show($id)
    {
        $attendance = Attendance::with(['user', 'schedule.shift', 'schedule.user'])->find($id);

        if (!$attendance) {
            return response()->json(['message' => 'Data absensi tidak ditemukan.'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $attendance
        ]);
    }

    public function statusToday()
    {
        $user = Auth::user();
        $today = Carbon::now()->toDateString();

        $attendance = Attendance::with('schedule.shift')
            ->where('user_id', $user->id)
            ->where('date', $today)
            ->first();

        return response()->json([
            'success' => true,
            'attendance' => $attendance,
            'has_clock_in' => $attendance && $attendance->clock_in ? true : false,
            'has_clock_out' => $attendance && $attendance->clock_out ? true : false,
        ]);
    }

    public function clockIn(Request $request)
    {
        $user = Auth::user();

        if (!$user->is_active) {
            return response()->json(['message' => 'Akun anda ditangguhkan karena pelanggaran absensi.'], 403);
        }

        $now = Carbon::now();
        $today = $now->toDateString();

        $schedule = Schedule::with('shift')
            ->where('user_id', $user->id)
            ->where('date', $today)
            ->first();

        if (!$schedule) {
            return response()->json(['message' => 'Tidak ada jadwal kerja hari ini.'], 403);
        }

        $existingAttendance = Attendance::where('user_id', $user->id)
            ->where('date', $today)
            ->where('status', '!=', 'alpha')
            ->first();

        if ($existingAttendance) {
            return response()->json(['message' => 'Anda sudah melakukan absensi hari ini.'], 400);
        }

        $startTime = Carbon::parse($today . ' ' . $schedule->shift->start_time);

        $earliestTime = (clone $startTime)->subMinutes(20);
        if ($now->lt($earliestTime)) {
            return response()->json([
                'message' => 'Sesi absen belum dibuka. Baru bisa absen pada jam ' . $earliestTime->format('H:i')
            ], 403);
        }

        $diffInMinutes = $startTime->diffInMinutes($now, false);

        if ($diffInMinutes > 60) {
            $this->handleAlpha($user, $schedule, $today);
            return response()->json(['message' => 'Batas waktu absen berakhir. Anda dianggap Alpha.'], 403);
        }

        $distance = $this->calculateDistance(
            $request->lat,
            $request->long,
            $this->officeLat,
            $this->officeLong
        );

        if ($distance > $this->maxDistance) {
            return response()->json(['message' => 'Diluar jangkauan kantor.'], 403);
        }

        $status = 'present';
        $penalty = 0;

        if ($diffInMinutes > 10) {
            $status = 'late';
            $lateDuration = $diffInMinutes - 10;
            $penalty = $lateDuration * $schedule->shift->late_penalty;
        }

        $attendance = Attendance::create([
            'user_id' => $user->id,
            'schedule_id' => $schedule->id,
            'date' => $today,
            'clock_in' => $now->toTimeString(),
            'lat_in' => $request->lat,
            'long_in' => $request->long,
            'status' => $status,
            'total_penalty' => $penalty
        ]);

        try {
            $admins = User::where('role_name', 'admin')->get();
            $notifMessage = "{$user->username} baru saja absen ({$status}) pada jam " . $now->format('H:i');
            $notifType = ($status === 'late') ? 'warning' : 'success';
            $notifLink = "/admin/attendance";

            Notification::send($admins, new GeneralNotification(
                $notifMessage,
                $notifType,
                $notifLink
            ));
        } catch (Exception $e) {
            Log::error("Gagal mengirim notifikasi absen: " . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => $status == 'late'
                ? 'Terlambat ' . $diffInMinutes . ' menit (Denda: Rp' . number_format($penalty, 0, ',', '.') . ')'
                : 'Absen berhasil (Tepat Waktu)',
            'data' => $attendance
        ]);
    }

    private function handleAlpha($user, $schedule, $today)
    {
        Attendance::updateOrCreate(
            ['user_id' => $user->id, 'date' => $today],
            [
                'schedule_id' => $schedule->id,
                'status' => 'alpha',
                'total_penalty' => 0
            ]
        );

        $alphaCount = Attendance::where('user_id', $user->id)
            ->where('status', 'alpha')
            ->count();

        try {
            $message = "Anda dianggap Alpha hari ini karena melewati batas waktu absen (60 menit).";
            $type = 'danger';

            if ($alphaCount >= 3) {
                $message .= " Akun Anda telah ditangguhkan otomatis karena sudah 3x Alpha.";
            } else {
                $message .= " Total Alpha Anda saat ini: {$alphaCount}. Hati-hati, 3x Alpha akun akan disuspend.";
            }

            $user->notify(new GeneralNotification(
                $message,
                $type,
                '/attendance'
            ));
        } catch (Exception $e) {
            Log::error("Gagal kirim notif Alpha ke pegawai: " . $e->getMessage());
        }
        if ($alphaCount >= 3) {
            User::where('id', $user->id)->update(['is_active' => false]);
        }
    }
    public function clockOut(Request $request)
    {
        $user = Auth::user();
        $now = Carbon::now();
        $today = $now->toDateString();

        $attendance = Attendance::with('schedule.shift')
            ->where('user_id', $user->id)
            ->where('date', $today)
            ->whereIn('status', ['present', 'late'])
            ->first();

        if (!$attendance || $attendance->clock_out) {
            return response()->json(['message' => 'Aksi tidak diizinkan atau Anda sudah absen pulang.'], 400);
        }

        $endTime = Carbon::parse($today . ' ' . $attendance->schedule->shift->end_time);
        if ($now->lt($endTime)) {
            return response()->json([
                'message' => 'Belum waktunya pulang. Jam pulang Anda adalah ' . $endTime->format('H:i')
            ], 403);
        }

        $attendance->update([
            'clock_out' => $now->toTimeString()
        ]);

        try {
            $admins = User::where('role_name', 'admin')->get();
            Notification::send($admins, new GeneralNotification(
                "{$user->username} telah absen pulang tepat waktu.",
                'info',
                '/admin/attendance'
            ));
        } catch (Exception $e) {
            Log::error("Gagal kirim notif clockout: " . $e->getMessage());
        }

        return response()->json(['success' => true, 'message' => 'Berhasil absen pulang.']);
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

    public function adminIndex(Request $request)
    {
        $query = Attendance::with(['user', 'schedule.shift']);

        if ($request->filled('search')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('username', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('role') && $request->role !== 'all') {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('role_name', $request->role);
            });
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        }

        $summary = [
            'total_penalty' => (clone $query)->sum('total_penalty'),
            'count_late' => (clone $query)->where('status', 'late')->count(),
            'count_alpha' => (clone $query)->where('status', 'alpha')->count(),
        ];

        $attendances = $query->latest('date')->paginate($request->get('per_page', 10));

        return response()->json([
            'success' => true,
            'summary' => $summary,
            'data' => $attendances->items(),
            'meta' => [
                'current_page' => $attendances->currentPage(),
                'last_page' => $attendances->lastPage(),
                'total' => $attendances->total(),
                'per_page' => $attendances->perPage(),
            ]
        ]);
    }

    public function exportExcel(Request $request)
    {
        $query = Attendance::with(['user', 'schedule.shift']);

        if ($request->filled('role') && $request->role !== 'all') {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('role_name', $request->role);
            });
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        }

        $data = $query->latest('date')->get();

        return Excel::download(new AttendanceExport($data), 'rekap_absen_' . now()->format('Ymd_His') . '.xlsx');
    }
}
