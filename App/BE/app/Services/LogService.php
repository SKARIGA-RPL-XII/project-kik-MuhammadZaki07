<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;

class LogService
{
   public static function write($module, $action, $message, $before = null, $after = null)
{
    $userId = Auth::id();

    if (!$userId) {
        $userId = $before['user_id'] ?? $after['user_id'] ?? null;
    }

    ActivityLog::create([
        'user_id' => $userId,
        'module' => $module,
        'action' => $action,
        'message' => $message,
        'payload_before' => $before,
        'payload_after' => $after,
        'ip_address' => request()->ip(),
    ]);
}
}
