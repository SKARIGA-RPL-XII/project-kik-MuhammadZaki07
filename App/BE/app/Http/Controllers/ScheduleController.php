<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\Attendance;
use App\Models\Shift;
use App\Models\User;
use App\Notifications\PicketScheduleNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class ScheduleController extends Controller
{
    public function index(Request $request)
    {
        $schedules = Schedule::with(['shift', 'user.role', 'user.employe'])
            ->when($request->start_date && $request->end_date, function ($query) use ($request) {
                return $query->whereBetween('date', [$request->start_date, $request->end_date]);
            })
            ->when($request->month, function ($query) use ($request) {
                return $query->whereMonth('date', $request->month);
            })
            ->get();

        return response()->json([
            'success' => true,
            'data' => $schedules
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'shift_id' => 'nullable|exists:shifts,id',
            'date' => 'required|date',
            'is_picket' => 'boolean',
            'is_holiday' => 'boolean',
            'note' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        return DB::transaction(function () use ($request) {
            $schedule = Schedule::updateOrCreate(
                ['user_id' => $request->user_id, 'date' => $request->date],
                $request->all()
            );

            if (!$request->is_holiday) {
                Attendance::updateOrCreate(
                    ['user_id' => $request->user_id, 'schedule_id' => $schedule->id, 'date' => $request->date],
                    ['status' => 'alpha']
                );
            }

            $user = User::find($request->user_id);

            if ($request->is_picket) {
                $user->notify(new PicketScheduleNotification($schedule));
            }

            return response()->json([
                'success' => true,
                'message' => 'Jadwal berhasil diperbarui',
                'data' => $schedule
            ]);
        });
    }

    public function destroy($id)
    {
        $schedule = Schedule::findOrFail($id);
        $schedule->delete();

        return response()->json([
            'success' => true,
            'message' => 'Jadwal dihapus'
        ]);
    }

 public function bulkStore(Request $request)
{
    $validator = Validator::make($request->all(), [
        'dates'                       => 'required|array',
        'schedules'                   => 'present|array',
        'schedules.*.user_id'         => 'required|exists:users,id',
        'schedules.*.date'            => 'required|date',
        'schedules.*.shift_id'        => 'nullable|exists:shifts,id',
        'shift_updates'               => 'nullable|array',
        'shift_updates.*.shift_id'    => 'required|exists:shifts,id',
        'shift_updates.*.start_time'  => 'required',
        'shift_updates.*.end_time'    => 'required',
    ]);

    if ($validator->fails()) {
        return response()->json($validator->errors(), 422);
    }

    return DB::transaction(function () use ($request) {
        if (!empty($request->shift_updates)) {
            foreach ($request->shift_updates as $shiftData) {
                Shift::where('id', $shiftData['shift_id'])->update([
                    'start_time' => $shiftData['start_time'],
                    'end_time'   => $shiftData['end_time']
                ]);
            }
        }

        $userIdsInPayload = collect($request->schedules)->pluck('user_id')->unique();

        Schedule::whereIn('date', $request->dates)
            ->whereNotIn('user_id', $userIdsInPayload)
            ->delete();

        foreach ($request->schedules as $item) {
            $dayNameEn = Carbon::parse($item['date'])->format('l');
            $dayMapping = [
                'Monday'    => 'Senin',
                'Tuesday'   => 'Selasa',
                'Wednesday' => 'Rabu',
                'Thursday'  => 'Kamis',
                'Friday'    => 'Jumat',
                'Saturday'  => 'Sabtu',
                'Sunday'    => 'Minggu',
            ];
            $dayNameId = $dayMapping[$dayNameEn];

            $schedule = Schedule::updateOrCreate(
                [
                    'user_id' => $item['user_id'],
                    'date'    => $item['date']
                ],
                [
                    'shift_id' => $item['shift_id'],
                    'day_name' => $dayNameId,
                    'note'     => $item['note'] ?? null
                ]
            );

            Attendance::firstOrCreate(
                [
                    'user_id' => $item['user_id'],
                    'date'    => $item['date']
                ],
                [
                    'schedule_id' => $schedule->id,
                    'status'      => 'alpha'
                ]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Sinkronisasi Jadwal & Shift Berhasil'
        ]);
    });
}
}
