<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Notifications\PushTestNotification;

class SendPushTest extends Command
{
    protected $signature = 'push:test';

    protected $description = 'Kirim notifikasi push test';

    public function handle()
    {
        $user = User::first();

        if (!$user) {
            $this->error('Tidak ada user di database!');
            return;
        }

        $payload = [
            'id' => 1,
            'title' => 'Test Notifikasi',
            'body' => 'Ini adalah pesan percobaan dengan parameter ID.'
        ];

        $user->notify(new PushTestNotification($payload));

        $this->info('Notifikasi berhasil dikirim!');
    }
}
