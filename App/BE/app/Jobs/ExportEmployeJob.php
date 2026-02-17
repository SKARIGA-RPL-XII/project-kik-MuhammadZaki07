<?php

namespace App\Jobs;

use App\Exports\EmployeeExport;
use App\Models\Notification;
use App\Events\SystemNotificationEvent;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Maatwebsite\Excel\Facades\Excel;

class ExportEmployeJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $userId;

    public function __construct($userId)
    {
        $this->userId = $userId;
    }

    public function handle(): void
    {
        $fileName = 'exports/employees_' . now()->timestamp . '.xlsx';

        Excel::store(new EmployeeExport, $fileName, 'public');

        $url = asset('storage/' . $fileName);

        $notification = Notification::create([
            'user_id' => $this->userId,
            'title' => 'Export Pegawai Selesai',
            'message' => 'Data pegawai yang Anda minta sudah siap diunduh.',
            'type' => 'export_alert',
            'is_global' => false,
            'data' => [
                'download_url' => $url
            ]
        ]);

        event(new SystemNotificationEvent($this->userId, $notification));
    }
}
