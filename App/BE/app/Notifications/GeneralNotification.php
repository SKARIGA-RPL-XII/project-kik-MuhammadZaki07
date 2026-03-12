<?php

namespace App\Notifications;

use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Support\Str;

class GeneralNotification extends Notification implements ShouldBroadcast
{
    public $message;
    public $type;
    public $link;

    public function __construct($message, $type = 'info', $link = null)
    {
        $this->message = $message;
        $this->type = $type;
        $this->link = $link;
    }

    public function via($notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toBroadcast($notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'message' => $this->message,
            'type' => $this->type,
            'link' => $this->link,
            'id' => Str::uuid()->toString(),
            'created_at' => now()->toDateTimeString(),
        ]);
    }

    public function toArray($notifiable): array
    {
        return [
            'message' => $this->message,
            'type' => $this->type,
            'link' => $this->link,
        ];
    }
}
