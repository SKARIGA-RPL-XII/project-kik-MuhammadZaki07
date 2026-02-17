<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;
use NotificationChannels\WebPush\WebPushMessage;

class PushTestNotification extends Notification
{
    use Queueable;

    public $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function via($notifiable)
    {
        return [WebPushChannel::class];
    }

    public function toWebPush($notifiable, $notification)
    {
        $id = $this->data['id'] ?? 0;
        $title = $this->data['title'] ?? 'Notifikasi Baru';
        $body = $this->data['body'] ?? 'Klik untuk melihat detail';

        return (new WebPushMessage)
            ->title($title)
            ->icon('/notification.png')
            ->body($body)
            ->data([
                'url' => '/notifications?open_id=' . $id
            ]);
    }
}
