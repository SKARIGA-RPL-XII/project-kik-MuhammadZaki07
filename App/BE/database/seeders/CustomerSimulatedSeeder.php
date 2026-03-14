<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Badge;
use App\Models\Menu;
use App\Models\Transaction;
use App\Models\Notification;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CustomerSimulatedSeeder extends Seeder
{
    public function run(): void
    {
        $badges = Badge::where('is_active', true)->orderBy('min_spend', 'asc')->get();
        $menus = Menu::all();

        if ($menus->isEmpty()) {
            $this->command->error("Menu masih kosong! Jalankan MenuSeeder dulu.");
            return;
        }

        for ($i = 1; $i <= 10; $i++) {
            $user = User::factory()->create([
                'name' => "Customer " . $i,
                'email' => "customer$i@gmail.com",
            ]);

            // flow:
            // User 1-3: Loyal (Transaksi banyak & mahal)
            // User 4-6: Normal (Transaksi 1-2 kali)
            // User 7-8: Baru (Hanya 1 transaksi pending)
            // User 9-10: Ghost (Tidak ada transaksi)

            if ($i <= 3) {
                $this->createHistory($user, $menus, rand(5, 8), 'completed', $badges);
            } elseif ($i <= 6) {
                $this->createHistory($user, $menus, rand(1, 2), 'completed', $badges);
            } elseif ($i <= 8) {
                $this->createHistory($user, $menus, 1, 'pending_payment', $badges);
            }
        }
    }

    private function createHistory($user, $menus, $count, $status, $badges)
    {
        for ($j = 0; $j < $count; $j++) {
            $totalAmount = 0;
            $itemsCount = rand(1, 4);

            $transaction = Transaction::create([
                'user_id' => $user->id,
                'transaction_code' => 'TRX-' . strtoupper(Str::random(8)),
                'status' => $status,
                'order_source' => 'qr_code',
                'total_amount' => 0,
                'transaction_date' => now()->subDays(rand(1, 30)),
                'paid_at' => $status === 'completed' ? now()->subDays(rand(1, 5)) : null,
            ]);

            for ($k = 0; $k < $itemsCount; $k++) {
                $menu = $menus->random();
                $qty = rand(1, 3);
                $subtotal = $menu->price * $qty;

                $transaction->details()->create([
                    'menu_id' => $menu->id,
                    'menu_qty' => $qty,
                    'price' => $menu->price,
                    'subtotal' => $subtotal,
                    'status' => $status === 'completed' ? 'served' : 'pending',
                ]);
                $totalAmount += $subtotal;
            }

            $transaction->update(['total_amount' => $totalAmount]);
        }

        $totalSpend = $user->total_spend;
        $assignedBadge = $badges->where('min_spend', '<=', $totalSpend)->last();

        if ($assignedBadge) {
            $user->update(['badge_id' => $assignedBadge->id]);
            Notification::create([
                'user_id' => $user->id,
                'title' => 'Level Up! 🎉',
                'message' => "Selamat! Kamu sekarang adalah member {$assignedBadge->name}.",
                'type' => 'achievement',
                'is_global' => false,
            ]);
        }

        Notification::create([
            'user_id' => $user->id,
            'title' => 'Riwayat Transaksi',
            'message' => "Pesanan kamu senilai Rp " . number_format($totalSpend) . " telah terekam.",
            'type' => 'info',
            'is_global' => false,
        ]);
    }
}
