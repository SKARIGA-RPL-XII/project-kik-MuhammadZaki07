<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $query = ActivityLog::query()
            ->with('user:id,username');


        if ($request->trashed === 'only') {
            $query->onlyTrashed();
        } elseif ($request->trashed === 'all') {
            $query->withTrashed();
        }

        $query->when($request->search, function ($q) use ($request) {
            $search = $request->search;

            $q->where(function ($sq) use ($search) {
                $sq->where('message', 'like', "%{$search}%")
                    ->orWhere('module', 'like', "%{$search}%")
                    ->orWhere('action', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($u) use ($search) {
                        $u->where('username', 'like', "%{$search}%");
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

        $logs = $query
            ->select([
                'id',
                'user_id',
                'module',
                'action',
                'message',
                'created_at',
                'deleted_at'
            ])
            ->orderByDesc('id')
            ->paginate(10);

        return response()->json([
            'status' => 'success',
            'data' => $logs->items(),
            'meta' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'total' => $logs->total(),
                'per_page' => $logs->perPage(),
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
        $log = ActivityLog::withTrashed()->findOrFail($id);

        if ($log->trashed()) {
            $log->forceDelete();

            return response()->json([
                'message' => 'Log berhasil dihapus permanen'
            ]);
        }

        $log->delete();

        return response()->json([
            'message' => 'Log berhasil dihapus (Soft Delete)'
        ]);
    }

    public function restore($id)
    {
        $log = ActivityLog::withTrashed()->findOrFail($id);
        $log->restore();

        return response()->json(['message' => 'Log berhasil dipulihkan']);
    }
}
