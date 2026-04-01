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
    public function index(Request $request)
    {
        $query = Leave::with(['user', 'admin']);

        if ($request->has('search')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('username', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->has('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $leaves = $query->latest()->paginate($request->get('per_page', 10));

        return response()->json([
            'success' => true,
            'data' => $leaves->items(),
            'meta' => [
                'current_page' => $leaves->currentPage(),
                'last_page' => $leaves->lastPage(),
                'total' => $leaves->total(),
                'per_page' => $leaves->perPage(),
            ]
        ]);
    }

    public function show($id)
    {
        $leave = Leave::with(['user', 'admin'])->findOrFail($id);
        return response()->json(['success' => true, 'data' => $leave]);
    }


    public function myLeaves(Request $request)
    {
        $query = Leave::where('user_id', Auth::id());

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('reason', 'like', "%{$search}%")
                    ->orWhere('type', 'like', "%{$search}%");
            });
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $leaves = $query->latest()->paginate($request->get('per_page', 10));

        return response()->json([
            'success' => true,
            'data' => $leaves->items(),
            'meta' => [
                'current_page' => $leaves->currentPage(),
                'last_page' => $leaves->lastPage(),
                'total' => $leaves->total(),
                'per_page' => $leaves->perPage(),
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'type'       => 'required|in:sick,leave,permit,vacation',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date'   => 'required|date|after_or_equal:start_date',
            'reason'     => 'required|string|min:10',
            'proof_file' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ], [
            'start_date.after_or_equal' => 'Masa lalu biarlah berlalu, tanggal izin tidak boleh sebelum hari ini.',
            'reason.min' => 'Berikan alasan yang lebih detail (minimal 10 karakter).'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $userId = Auth::id();
        $startDate = $request->start_date;
        $endDate = $request->end_date;

        $isOverlapping = Leave::where('user_id', $userId)
            ->whereIn('status', ['pending', 'approved'])
            ->where(function ($query) use ($startDate, $endDate) {
                $query->whereBetween('start_date', [$startDate, $endDate])
                    ->orWhereBetween('end_date', [$startDate, $endDate])
                    ->orWhere(function ($q) use ($startDate, $endDate) {
                        $q->where('start_date', '<=', $startDate)
                            ->where('end_date', '>=', $endDate);
                    });
            })->exists();

        if ($isOverlapping) {
            return response()->json([
                'success' => false,
                'errors' => ['start_date' => ['Anda sudah memiliki pengajuan izin (Pending/Approved) pada tanggal tersebut.']]
            ], 422);
        }

        $currentMonth = Carbon::parse($startDate)->month;
        $currentYear = Carbon::parse($startDate)->year;

        $monthlyCount = Leave::where('user_id', $userId)
            ->whereIn('status', ['pending', 'approved'])
            ->whereMonth('start_date', $currentMonth)
            ->whereYear('start_date', $currentYear)
            ->count();

        if ($monthlyCount >= 3) {
            return response()->json([
                'success' => false,
                'message' => 'Batas pengajuan izin maksimal 3 kali per bulan sudah tercapai.'
            ], 422);
        }

        $data = $request->only(['type', 'start_date', 'end_date', 'reason']);
        $data['user_id'] = $userId;
        $data['status'] = 'pending';

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
