<?php

namespace App\Notifications;

use App\Models\Schedule;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PicketScheduleNotification extends Notification
{
    use Queueable;

    protected $schedule;

    public function __construct(Schedule $schedule)
    {
        $this->schedule = $schedule;
    }

    public function via($notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Jadwal Piket Baru: ' . $this->schedule->date->format('d M Y'))
            ->greeting('Halo, ' . $notifiable->name . '!')
            ->line('Kamu telah dijadwalkan untuk piket pada tanggal ' . $this->schedule->date->format('l, d F Y') . '.')
            ->line('Catatan Admin: ' . ($this->schedule->note ?? '-'))
            ->action('Lihat Jadwal', url('/dashboard/schedule'))
            ->line('Mohon datang tepat waktu untuk menghindari sanksi.');
    }

    public function toArray($notifiable): array
    {
        return [
            'schedule_id' => $this->schedule->id,
            'date' => $this->schedule->date->format('Y-m-d'),
            'type' => 'picket',
            'message' => 'Kamu dapet jadwal piket buat tanggal ' . $this->schedule->date->format('d M Y'),
            'icon' => 'CalendarIcon'
        ];
    }
}
