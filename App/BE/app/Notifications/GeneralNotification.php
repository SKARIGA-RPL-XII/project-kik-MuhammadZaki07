<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;

class GeneralNotification extends Notification
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

    public function toArray($notifiable): array
    {
        return [
            'message' => $this->message,
            'type' => $this->type,
            'link' => $this->link,
        ];
    }

    public function toBroadcast($notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'message' => $this->message,
            'type' => $this->type,
            'link' => $this->link,
        ]);
    }
}
