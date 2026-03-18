<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $query = ActivityLog::with('user');

        $query->when($request->search, function ($q) use ($request) {
            $q->where(function ($sq) use ($request) {
                $sq->where('message', 'like', '%' . $request->search . '%')
                    ->orWhereHas('user', function ($u) use ($request) {
                        $u->where('username', 'like', '%' . $request->search . '%');
                    });
            });
        });

        $query->when($request->module, function ($q) use ($request) {
            $q->where('module', $request->module);
        });

        $query->when($request->action, function ($q) use ($request) {
            $q->where('action', $request->action);
        });

        $query->when($request->date, function ($q) use ($request) {
            $q->whereDate('created_at', $request->date);
        });

        $logs = $query->orderBy('created_at', 'desc')->paginate(10);

        return response()->json([
            'status' => 'success',
            'data' => $logs->items(),
            'meta' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'total' => $logs->total(),
                'per_page' => $logs->perPage(),
                'from' => $logs->firstItem(),
                'to' => $logs->lastItem(),
            ]
        ]);
    }

    public function show($id)
    {
        $log = ActivityLog::with('user')->findOrFail($id);
        return response()->json(['data' => $log]);
    }

    public function destroy($id)
    {
        $log = ActivityLog::findOrFail($id);
        $log->delete();

        return response()->json(['message' => 'Log berhasil dihapus (Soft Delete)']);
    }

    public function restore($id)
    {
        $log = ActivityLog::withTrashed()->findOrFail($id);
        $log->restore();

        return response()->json(['message' => 'Log berhasil dipulihkan']);
    }
}
