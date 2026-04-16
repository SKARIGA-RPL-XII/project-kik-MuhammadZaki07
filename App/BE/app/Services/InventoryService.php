<?php

namespace App\Services;

use App\Models\Transaction;
use Illuminate\Support\Facades\DB;

class InventoryService
{
    public function decrease(Transaction $transaction): void
    {
        DB::transaction(function () use ($transaction) {

            foreach ($transaction->details as $detail) {

                $menu = $detail->menu;

                foreach ($menu->stocks as $ms) {
                    $stock = $ms;

                    $needed = $ms->pivot->amount * $detail->menu_qty;

                    if ($stock->quantity < $needed) {
                        throw new \Exception("Stock tidak cukup untuk {$menu->name}");
                    }

                    $stock->decrement('quantity', $needed);
                }
            }
        });
    }
}
