<?php

namespace App\Http\Controllers;

use App\Models\Leave;
use App\Models\Attendance;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

class LeaveController extends Controller
{
    public function index()
    {
        $leaves = Leave::with(['user', 'admin'])->latest()->get();
        return response()->json(['success' => true, 'data' => $leaves]);
    }

    public function myLeaves()
    {
        $leaves = Leave::where('user_id', Auth::id())->latest()->get();
        return response()->json(['success' => true, 'data' => $leaves]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:sick,leave,permit,vacation',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'required|string',
            'proof_file' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $data = $request->all();
        $data['user_id'] = Auth::id();

        if ($request->hasFile('proof_file')) {
            $data['proof_file'] = $request->file('proof_file')->store('leaves', 'public');
        }

        $leave = Leave::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan izin berhasil dikirim.',
            'data' => $leave
        ]);
    }

    public function approve(Request $request, $id)
    {
        $leave = Leave::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:approved,rejected',
            'rejected_reason' => 'required_if:status,rejected'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $leave->update([
            'status' => $request->status,
            'rejected_reason' => $request->status === 'rejected' ? $request->rejected_reason : null,
            'approved_by' => Auth::id()
        ]);

        if ($request->status === 'approved') {
            $period = CarbonPeriod::create($leave->start_date, $leave->end_date);

            foreach ($period as $date) {
                $formattedDate = $date->format('Y-m-d');
                $schedule = Schedule::where('user_id', $leave->user_id)
                    ->where('date', $formattedDate)
                    ->first();

                if ($schedule) {
                    Attendance::updateOrCreate(
                        [
                            'user_id' => $leave->user_id,
                            'date' => $formattedDate,
                        ],
                        [
                            'schedule_id' => $schedule->id,
                            'status' => 'leave',
                            'total_penalty' => 0,
                            'clock_in' => null,
                            'clock_out' => null
                        ]
                    );
                }
            }
        }

        return response()->json(['success' => true, 'message' => 'Status izin diperbarui dan absensi disinkronkan.']);
    }
}
