<?php

namespace App\Services;

use App\Models\{Transaction, Menu, Stock, Table, AttributeLevel, Badge, User};
use App\Notifications\GeneralNotification;
use Illuminate\Support\Facades\{DB, Auth, Log};
use Midtrans\Snap;
use Midtrans\Config;
use Exception;

class PosService
{
    public function execute(array $data, $cashierId = null)
    {
        return DB::transaction(function () use ($data, $cashierId) {
            Log::info("=== [START TRANSACTION] ===");
            Log::info("Order Source: " . $data['order_source'] . " | Method: " . $data['payment_method']);


            $taxRate = (float) (DB::table('settings')->where('key', 'tax_percent')->first()->value ?? 0);
            $serviceRate = (float) (DB::table('settings')->where('key', 'service_percent')->first()->value ?? 0);
            $transactionCode = date('ymd') . str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
            while (Transaction::where('transaction_code', $transactionCode)->exists()) {
                $transactionCode = date('ymd') . str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
            }

            if ($data['order_type'] === 'dine_in' && !empty($data['table_id'])) {
                $table = Table::lockForUpdate()->findOrFail($data['table_id']);
                if ($table->status === 'occupied') throw new Exception("Table occupied.");
                $table->update(['status' => 'occupied']);
            }

            $subtotal = 0;
            $tempItems = [];

            foreach ($data['items'] as $item) {
                $menu = Menu::findOrFail($item['menu_id']);
                $priceUsed = (int) ($item['price_at_transaction'] ?? $menu->price);
                $itemSubtotal = $priceUsed * $item['quantity'];
                $subtotal += $itemSubtotal;

                $tempItems[] = [
                    'menu' => $menu,
                    'quantity' => $item['quantity'],
                    'price' => $priceUsed,
                    'subtotal' => $itemSubtotal,
                    'attributes' => $item['attributes'] ?? [],
                ];
            }

            $serviceAmount = round(($subtotal * $serviceRate) / 100);
            $taxAmount = round((($subtotal + $serviceAmount) * $taxRate) / 100);
            $grandTotal = $subtotal + $serviceAmount + $taxAmount;

            if (isset($data['total_amount']) && abs($data['total_amount'] - $grandTotal) < 500) {
                $grandTotal = $data['total_amount'];
            }

            $status = ($data['order_source'] === 'cashier_direct' && $data['payment_method'] === 'cash')
                ? 'paid'
                : 'pending_payment';


            $isCashier = $data['order_source'] === 'cashier_direct';

            $transaction = Transaction::create([
                'table_id' => $data['table_id'] ?? null,
                'user_id' => Auth::id(),
                'customer_name' => $data['customer_name'] ?? (Auth::user()->name ?? 'Guest'),
                'cashier_id' => $isCashier ? ($cashierId ?? Auth::id()) : null,
                'order_source' => $data['order_source'],
                'status' => $status,
                // 'transaction_code' => $transactionCode,
                'transaction_code' => "TR-MLG-" . $transactionCode,
                'total_amount' => $grandTotal,
                'amount_paid' => ($status === 'paid') ? ($data['amount_paid'] ?? $grandTotal) : null,
                'payment_method' => $data['payment_method'],
                'transaction_date' => now(),
                'paid_at' => ($status === 'paid') ? now() : null,
            ]);

            Log::info("Transaction Created: " . $transaction->transaction_code . " with Status: " . $status);

            if ($status === 'paid') {
                Log::info("Direct Cashier Order: Processing Stock Immediately.");
                $this->decreaseInventory($transaction);
                $transaction->update(['status' => 'cooking']);
            } else {
                Log::info("Online/Pending Order: Stock not reduced yet. Waiting for payment.");
            }

            foreach ($tempItems as $t) {
                $transaction->details()->create([
                    'menu_id' => $t['menu']->id,
                    'menu_qty' => $t['quantity'],
                    'price' => $t['price'],
                    'subtotal' => $t['subtotal'],
                    'attributes' => $t['attributes'],
                ]);
            }

            $snapToken = null;
            if ($data['payment_method'] !== 'cash') {
                $snapToken = $this->generateMidtransToken($transaction, $tempItems, $data['settings'] ?? []);
            }

            return [
                'transaction' => $transaction,
                'snap_token' => $snapToken
            ];
        });
    }

    public function executeBooking(array $data)
    {
        return DB::transaction(function () use ($data) {
            $taxRate = (float) (DB::table('settings')->where('key', 'tax_percent')->first()->value ?? 0);
            $serviceRate = (float) (DB::table('settings')->where('key', 'service_percent')->first()->value ?? 0);

            $transactionCode = "TR-BOK-" . date('ymd') . str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);

            $subtotal = 0;
            $tempItems = [];

            foreach ($data['items'] as $item) {
                $menu = Menu::findOrFail($item['menu_id']);
                $itemSubtotal = $menu->price * $item['quantity'];
                $subtotal += $itemSubtotal;

                $tempItems[] = [
                    'menu' => $menu,
                    'quantity' => $item['quantity'],
                    'price' => $menu->price,
                    'subtotal' => $itemSubtotal,
                    'attributes' => $item['attributes'] ?? [],
                ];
            }

            $serviceAmount = round(($subtotal * $serviceRate) / 100);
            $taxAmount = round((($subtotal + $serviceAmount) * $taxRate) / 100);
            $grandTotal = $subtotal + $serviceAmount + $taxAmount;

            $transaction = Transaction::create([
                'table_id' => $data['table_id'],
                'user_id' => Auth::id(),
                'customer_name' => Auth::user()->name,
                'order_source' => 'qr_code',
                'status' => 'pending_payment',
                'transaction_code' => $transactionCode,
                'total_amount' => $grandTotal,
                'payment_method' => $data['payment_method'],
                'transaction_date' => now(),
            ]);

            foreach ($tempItems as $t) {
                $transaction->details()->create([
                    'menu_id' => $t['menu']->id,
                    'menu_qty' => $t['quantity'],
                    'price' => $t['price'],
                    'subtotal' => $t['subtotal'],
                    'attributes' => $t['attributes'],
                ]);
            }

            $snapToken = null;
            if ($data['payment_method'] !== 'cash') {
                $snapToken = $this->generateMidtransToken($transaction, $tempItems, $data['settings'] ?? []);
                $transaction->update(['snap_token' => $snapToken]);
            }

            return [
                'transaction' => $transaction,
                'snap_token' => $snapToken
            ];
        });
    }

    public function decreaseInventory($transaction)
    {
        Log::info("--- [DECREASING STOCK] --- for Transaction: " . $transaction->transaction_code);
        foreach ($transaction->details as $detail) {
            $menu = Menu::with('stocks')->find($detail->menu_id);
            $this->processStockReduction($menu, $detail->menu_qty);
            Log::info("Processing Menu: " . $menu->name . " | Qty: " . $detail->menu_qty);
            if (!empty($detail->attributes)) {
                $this->processAttributeStock($detail->attributes, $detail->menu_qty);
            }
        }

        if ($transaction->user_id) {
            $this->updateUserBadge($transaction->user_id);

            $user = User::find($transaction->user_id);
            $user->notify(new GeneralNotification(
                "Pembayaran berhasil! Pesanan {$transaction->transaction_code} sedang diproses.",
                'payment_success',
                "/orders/{$transaction->id}"
            ));
        }
        Log::info("--- [STOCK REDUCED SUCCESSFULLY] ---");
    }

    private function processStockReduction($menu, $qty)
    {
        foreach ($menu->stocks as $ms) {
            $stock = Stock::lockForUpdate()->find($ms->id);
            if (!$stock) throw new Exception("Stock ID {$ms->id} not found.");

            $needed = $ms->pivot->amount * $qty;
            if ($stock->quantity < $needed) {
                throw new Exception("Insufficient stock for {$stock->name}.");
            }

            $stock->decrement('quantity', $needed);

            DB::table('stock_adjustments')->insert([
                'stock_id' => $stock->id,
                'type' => 'out',
                'amount' => $needed,
                'reason' => "Sales: {$menu->name}",
                'user_id' => Auth::id() ?? 1,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
    }

    private function processAttributeStock($attributes, $parentQty)
    {
        $attrList = is_string($attributes) ? json_decode($attributes, true) : $attributes;

        if (!is_array($attrList)) return;

        foreach ($attrList as $attr) {
            $attrId = is_array($attr) ? ($attr['id'] ?? null) : $attr;

            if (!$attrId) continue;

            $attrLevel = AttributeLevel::find($attrId);

            if ($attrLevel && $attrLevel->stock_id) {
                $stock = Stock::lockForUpdate()->find($attrLevel->stock_id);
                if (!$stock) continue;

                $needed = $attrLevel->pull_quantity * $parentQty;

                if ($stock->quantity < $needed) {
                    throw new Exception("Insufficient stock for attribute: {$attrLevel->name}");
                }

                $stock->decrement('quantity', $needed);
            }
        }
    }

    // private function generateMidtransToken($transaction, $items, $settings)
    // {
    //     Config::$serverKey = config('midtrans.server_key');
    //     Config::$isProduction = (bool) config('midtrans.is_production');
    //     Config::$isSanitized = true;
    //     Config::$is3ds = true;

    //     $availableMethods = is_string($settings['available_methods'] ?? '')
    //         ? json_decode($settings['available_methods'], true)
    //         : ($settings['available_methods'] ?? []);

    //     $enabledPayments = collect($availableMethods)
    //         ->filter(fn($method) => (isset($method['active']) && $method['active'] == 1))
    //         ->pluck('id')
    //         ->toArray();

    //     $params = [
    //         'transaction_details' => [
    //             'order_id' => 'TRX-' . $transaction->id . '-' . time(),
    //             'gross_amount' => (int) $transaction->total_amount,
    //         ],
    //         // 'callbacks' => [
    //         //     'finish' => env('FRONTEND_URL') . '/cashier',
    //         // ],
    //         'item_details' => collect($items)->map(function ($t) {
    //             return [
    //                 'id' => $t['menu']->id,
    //                 'price' => (int) $t['price'],
    //                 'quantity' => $t['quantity'],
    //                 'name' => substr($t['menu']->name, 0, 50)
    //             ];
    //         })->toArray(),
    //     ];

    //     if (!empty($enabledPayments)) {
    //         $params['enabled_payments'] = $enabledPayments;
    //     }

    //     return Snap::getSnapToken($params);
    // }

    public function generateMidtransToken($transaction, $items, $settings)
    {
        try {
            Config::$serverKey = config('midtrans.server_key');
            Config::$isProduction = (bool) config('midtrans.is_production');
            Config::$isSanitized = true;
            Config::$is3ds = true;

            $itemDetails = [];
            $subtotal = 0;

            if (empty($items)) {
                $itemDetails[] = [
                    'id'       => 'DEP-' . $transaction->id,
                    'price'    => (int) $transaction->total_amount,
                    'quantity' => 1,
                    'name'     => 'Deposit / Booking Fee'
                ];
            } else {
                $itemDetails = collect($items)->map(function ($t) {
                    return [
                        'id'       => 'MN-' . $t['menu']->id,
                        'price'    => (int) $t['price'],
                        'quantity' => $t['quantity'],
                        'name'     => substr($t['menu']->name, 0, 50)
                    ];
                })->toArray();

                $taxPercent = $settings['tax_percent']['value'] ?? 0;
                $servicePercent = $settings['service_percent']['value'] ?? 0;
                $subtotal = collect($items)->sum(fn($i) => $i['price'] * $i['quantity']);

                $serviceAmount = round(($subtotal * $servicePercent) / 100);
                $taxAmount = round((($subtotal + $serviceAmount) * $taxPercent) / 100);

                if ($serviceAmount > 0) {
                    $itemDetails[] = ['id' => 'SVC-CHG', 'price' => (int)$serviceAmount, 'quantity' => 1, 'name' => 'Service Charge'];
                }
                if ($taxAmount > 0) {
                    $itemDetails[] = ['id' => 'TAX-CHG', 'price' => (int)$taxAmount, 'quantity' => 1, 'name' => 'Tax'];
                }
            }

            $params = [
                'transaction_details' => [
                    'order_id'     => $transaction->transaction_code . '-' . time(),
                    'gross_amount' => (int) round($transaction->total_amount),
                ],
                'item_details' => $itemDetails,
                'customer_details' => [
                    'first_name' => Auth::user()->username ?? 'Customer',
                    'email'      => Auth::user()->email,
                ],
            ];

            $methods = $settings['available_methods']['value'] ?? [];
            if (is_array($methods)) {
                $enabledPayments = collect($methods)
                    ->filter(fn($method) => (isset($method['active']) && $method['active'] == 1))
                    ->pluck('id')
                    ->toArray();

                if (!empty($enabledPayments)) {
                    $params['enabled_payments'] = $enabledPayments;
                }
            }

            return Snap::getSnapToken($params);
        } catch (Exception $e) {
            Log::error("Midtrans Error: " . $e->getMessage());
            return null;
        }
    }

    public function updateUserBadge($userId)
    {
        $user = User::find($userId);
        if (!$user) return;

        $totalSpent = Transaction::where('user_id', $userId)
            ->whereIn('status', ['paid', 'completed'])
            ->sum('total_amount');

        $eligibleBadge = Badge::where('is_active', true)
            ->where('min_spend', '<=', $totalSpent)
            ->orderBy('min_spend', 'desc')
            ->first();

        if ($eligibleBadge && $user->badge_id != $eligibleBadge->id) {
            $user->update(['badge_id' => $eligibleBadge->id]);

            $message = "Selamat! Total belanjamu mencapai Rp" . number_format($totalSpent, 0, ',', '.') . ". Kamu naik level ke " . $eligibleBadge->name . "!";

            $user->notify(new GeneralNotification(
                $message,
                'level_up',
                '/profile-customer'
            ));
            broadcast(new \App\Events\UserLevelUp($user, $eligibleBadge))->toOthers();
        }
    }

    public function completePaymentProcess(Transaction $transaction)
    {
        $this->decreaseInventory($transaction);

        $transaction->load(['details.menu', 'table', 'user']);

        event(new \App\Events\PaymentConfirmed($transaction));
        event(new \App\Events\NewOrderReceived($transaction));

        return $transaction;
    }
}
