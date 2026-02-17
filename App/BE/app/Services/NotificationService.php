<?php
namespace App\Services;

use App\Models\Notification;
use App\Events\SystemNotificationEvent;
use Illuminate\Support\Facades\DB;

class NotificationService
{
    public static function send(array $params)
    {
        return DB::transaction(function () use ($params) {
            $notification = Notification::create([
                'type'      => $params['type'],
                'title'     => $params['title'],
                'message'   => $params['message'],
                'data'      => $params['data'] ?? [],
                'user_id'   => $params['user_id'] ?? null,
                'role_id'   => $params['role_id'] ?? null,
                'is_global' => $params['is_global'] ?? false,
            ]);

            broadcast(new SystemNotificationEvent($notification))->toOthers();

            return $notification;
        });
    }
}
