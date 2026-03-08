<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Transaction;
use App\Models\Badge;

class SyncUserBadges extends Command
{
    protected $signature = 'user:sync-badges';
    protected $description = 'Update semua badge user berdasarkan total belanja lama';

    public function handle()
    {
        $users = User::all();
        $this->info('Memulai sinkronisasi ' . $users->count() . ' user...');

        foreach ($users as $user) {
            $totalSpent = Transaction::where('user_id', $user->id)
                ->whereIn('status', ['paid', 'completed'])
                ->sum('total_amount');

            $eligibleBadge = Badge::where('min_spend', '<=', $totalSpent)
                ->orderBy('min_spend', 'desc')
                ->first();

            if ($eligibleBadge && $user->badge_id != $eligibleBadge->id) {
                $user->update(['badge_id' => $eligibleBadge->id]);
                $this->info("User {$user->username} naik ke level: {$eligibleBadge->name}");
            }
        }

        $this->info('Sinkronisasi selesai!');
    }
}
