<?php

namespace App\Actions\AI;

use App\DTO\AIRequestDTO;
use App\Models\Transaction;
use Illuminate\Support\Facades\Cache;

class GetUserTransactions
{
    public function handle(AIRequestDTO $dto)
    {
        $key = "ai:user:trx:{$dto->userId}";

        return Cache::remember($key, now()->addMinutes(5), function () use ($dto) {

            return Transaction::query()
                ->where('user_id', $dto->userId)
                ->where('status', 'completed')
                ->with([
                    'details.menu:id,name,price,discount_id'
                ])
                ->latest()
                ->limit(5)
                ->get()
                ->map(function ($trx) {
                    return [
                        'id' => $trx->id,
                        'total' => $trx->total_amount,
                        'date' => $trx->transaction_date,
                        'items' => $trx->details->map(function ($detail) {
                            return [
                                'menu' => $detail->menu?->name,
                                'qty' => $detail->menu_qty,
                                'subtotal' => $detail->subtotal,
                            ];
                        }),
                    ];
                });
        });
    }
}
