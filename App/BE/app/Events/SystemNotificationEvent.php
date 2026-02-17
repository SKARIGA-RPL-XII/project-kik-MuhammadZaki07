<?php
namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SystemNotificationEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $userId;
    public $notification;
    public $roleId;

    public function __construct($userId, $notification, $roleId = null)
    {
        $this->userId = $userId;
        $this->notification = $notification;
        $this->roleId = $roleId;
    }

    public function broadcastOn(): array
    {
        $channels = [new Channel('notifications.global')];

        if ($this->userId) {
            $channels[] = new PrivateChannel('notifications.user.' . $this->userId);
        }

        if ($this->roleId) {
            $channels[] = new Channel('notifications.role.' . $this->roleId);
        }

        return $channels;
    }

    public function broadcastAs()
    {
        return 'notification.received';
    }

    public function broadcastWith()
    {
        // Mengirim data dalam bentuk objek 'notification' agar sesuai dengan (e: { notification: Notification }) di React
        return [
            'notification' => $this->notification
        ];
    }
}
