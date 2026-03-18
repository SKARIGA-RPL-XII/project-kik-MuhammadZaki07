<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;

class LogService
{
    public static function write($module, $action, $message, $before = null, $after = null)
    {
        ActivityLog::create([
            'user_id' => Auth::id(),
            'module' => $module,
            'action' => $action,
            'message' => $message,
            'payload_before' => $before,
            'payload_after' => $after,
            'ip_address' => request()->ip(),
        ]);
    }
}
