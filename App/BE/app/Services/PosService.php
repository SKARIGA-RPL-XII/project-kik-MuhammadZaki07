<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\Menu;
use App\Models\Stock;
use App\Models\Table;
use App\Models\AttributeLevel;
use Illuminate\Support\Facades\DB;
use Exception;
use Illuminate\Support\Facades\Auth;

class PosService
{
    public function execute(array $data, $cashierId = null)
    {
        return DB::transaction(function () use ($data, $cashierId) {
            $taxSetting = DB::table('settings')->where('key', 'tax_percent')->first();
            $serviceSetting = DB::table('settings')->where('key', 'service_percent')->first();

            $taxRate = $taxSetting ? (float)$taxSetting->value : 0;
            $serviceRate = $serviceSetting ? (float)$serviceSetting->value : 0;

            if ($data['order_type'] === 'dine_in') {
                $table = Table::lockForUpdate()->findOrFail($data['table_id']);
                if ($table->status === 'occupied') {
                    throw new Exception("Table is already occupied.");
                }
                $table->update(['status' => 'occupied']);
            }

            $transaction = Transaction::create([
                'table_id' => $data['table_id'] ?? null,
                'user_id' => Auth::user()->id,
                'cashier_id' => $cashierId,
                'order_source' => $data['order_source'],
                'status' => 'pending_payment',
                'total_amount' => 0,
                'payment_method' => $data['payment_method'],
                'transaction_date' => now(),
            ]);

            $subtotal = 0;

            foreach ($data['items'] as $item) {
                $menu = Menu::with(['stocks'])->lockForUpdate()->findOrFail($item['menu_id']);

                $this->processStockReduction($menu, $item['quantity']);

                if (!empty($item['attributes'])) {
                    $this->processAttributeStock($item['attributes'], $item['quantity']);
                }

                $itemSubtotal = $menu->price * $item['quantity'];
                $subtotal += $itemSubtotal;

                $transaction->details()->create([
                    'menu_id' => $menu->id,
                    'menu_qty' => $item['quantity'],
                    'price' => $menu->price,
                    'subtotal' => $itemSubtotal,
                    'status' => 'pending'
                ]);
            }

            $serviceAmount = ($subtotal * $serviceRate) / 100;
            $taxAmount = (($subtotal + $serviceAmount) * $taxRate) / 100;
            $grandTotal = $subtotal + $serviceAmount + $taxAmount;

            $transaction->update(['total_amount' => $grandTotal]);

            event(new \App\Events\OrderProcessed($transaction));

            return $transaction;
        });
    }

    private function processStockReduction($menu, $qty)
    {
        foreach ($menu->stocks as $ms) {
            $stock = Stock::lockForUpdate()->find($ms->id);

            if (!$stock) {
                throw new Exception("Stock item with ID {$ms->id} not found in inventory.");
            }

            $needed = $ms->pivot->amount * $qty;

            if ($stock->quantity < $needed) {
                throw new Exception("Insufficient stock for {$stock->name}. Available: {$stock->quantity}, Needed: {$needed}");
            }

            $stock->decrement('quantity', $needed);

            DB::table('stock_adjustments')->insert([
                'stock_id' => $stock->id,
                'type' => 'out',
                'amount' => $needed,
                'reason' => "Sales: {$menu->name}",
                'user_id' => Auth::user()->id ?? $this->getSystemUserId(),
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
                    throw new Exception("Insufficient stock for attribute: {$stock->name}.");
                }

                $stock->decrement('quantity', $needed);
            }
        }
    }

    public function completePayment($transactionId, $amountPaid)
    {
        return DB::transaction(function () use ($transactionId, $amountPaid) {
            $transaction = Transaction::findOrFail($transactionId);

            if ($amountPaid < $transaction->total_amount) {
                throw new Exception("Amount paid is not enough.");
            }

            $transaction->update([
                'status' => 'paid',
                'amount_paid' => $amountPaid,
                'change_amount' => $amountPaid - $transaction->total_amount,
                'paid_at' => now(),
            ]);

            if ($transaction->table_id) {
                Table::where('id', $transaction->table_id)->update(['status' => 'available']);
            }

            return $transaction;
        });
    }

    private function getSystemUserId()
    {
        return 1;
    }
}
