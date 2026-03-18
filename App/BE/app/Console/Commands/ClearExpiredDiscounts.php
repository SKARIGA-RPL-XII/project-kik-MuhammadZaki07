<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Discount;
use App\Models\Menu;
use Illuminate\Support\Facades\DB;

class ClearExpiredDiscounts extends Command
{
    protected $signature = 'discounts:clear-expired';
    protected $description = 'Menonaktifkan diskon kadaluarsa dan menghapus discount_id di tabel menus';

    public function handle()
    {
        $expiredDiscountIds = Discount::where('is_active', true)
            ->where('end_date', '<', now()->toDateString())
            ->pluck('id');

        if ($expiredDiscountIds->isEmpty()) {
            $this->info('Tidak ada diskon yang kadaluarsa hari ini.');
            return;
        }

        DB::transaction(function () use ($expiredDiscountIds) {
            Menu::whereIn('discount_id', $expiredDiscountIds)
                ->update(['discount_id' => null]);

            Discount::whereIn('id', $expiredDiscountIds)
                ->update(['is_active' => false]);
        });

        $this->info(count($expiredDiscountIds) . ' Diskon berhasil dibersihkan.');
    }
}
