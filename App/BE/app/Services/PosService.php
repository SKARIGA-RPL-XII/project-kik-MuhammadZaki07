<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\Menu;
use App\Models\Stock;
use App\Models\Table;
use App\Models\AttributeLevel;
use Illuminate\Support\Facades\DB;
use Exception;

class PosService
{
    public function execute(array $data, $cashierId = null)
    {
        return DB::transaction(function () use ($data, $cashierId) {
            if ($data['order_type'] === 'dine_in') {
                $table = Table::lockForUpdate()->findOrFail($data['table_id']);
                if ($table->status === 'occupied') {
                    throw new Exception("Meja sedang digunakan.");
                }
                $table->update(['status' => 'occupied']);
            }

            $transaction = Transaction::create([
                'table_id' => $data['table_id'] ?? null,
                'user_id' => auth()->id(),
                'cashier_id' => $cashierId,
                'order_source' => $data['order_source'],
                'status' => 'pending_payment',
                'total_amount' => 0,
                'payment_method' => $data['payment_method'],
                'transaction_date' => now(),
            ]);

            $totalAmount = 0;

            foreach ($data['items'] as $item) {
                $menu = Menu::with(['menuStocks'])->lockForUpdate()->findOrFail($item['menu_id']);

                $this->processStockReduction($menu, $item['quantity']);

                if (!empty($item['attributes'])) {
                    $this->processAttributeStock($item['attributes'], $item['quantity']);
                }

                $subtotal = $menu->price * $item['quantity'];
                $totalAmount += $subtotal;

                $transaction->details()->create([
                    'menu_id' => $menu->id,
                    'menu_qty' => $item['quantity'],
                    'price' => $menu->price,
                    'subtotal' => $subtotal,
                    'status' => 'pending'
                ]);
            }

            $transaction->update(['total_amount' => $totalAmount]);
            event(new \App\Events\OrderProcessed($transaction));

            return $transaction;
        });
    }

    private function processStockReduction($menu, $qty)
    {
        foreach ($menu->menuStocks as $ms) {
            $stock = Stock::lockForUpdate()->find($ms->stock_id);
            $needed = $ms->amount * $qty;

            if ($stock->quantity < $needed) {
                throw new Exception("Stok {$stock->name} tidak cukup.");
            }

            $stock->decrement('quantity', $needed);

            DB::table('stock_adjustments')->insert([
                'stock_id' => $stock->id,
                'type' => 'out',
                'amount' => $needed,
                'reason' => "Penjualan: {$menu->name}",
                'user_id' => auth()->id() ?? $this->getSystemUserId(),
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
    }

    private function processAttributeStock($attributes, $parentQty)
    {
        foreach ($attributes as $attrLevelId) {
            $attrLevel = AttributeLevel::lockForUpdate()->find($attrLevelId);
            if ($attrLevel && $attrLevel->stock_id) {
                $stock = Stock::lockForUpdate()->find($attrLevel->stock_id);
                $needed = $attrLevel->pull_quantity * $parentQty;

                if ($stock->quantity < $needed) {
                    throw new Exception("Stok atribut {$stock->name} tidak cukup.");
                }

                $stock->decrement('quantity', $needed);
            }
        }
    }

    private function getSystemUserId()
    {
        return 1;
    }
}
