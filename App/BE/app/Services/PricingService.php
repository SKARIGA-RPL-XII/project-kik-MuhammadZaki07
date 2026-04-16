<?php

namespace App\Services;

use App\Models\Menu;
use Illuminate\Support\Facades\Log;

class PricingService
{
    public function calculate(array $items, array $settings = []): array
    {
        $taxPercent = (float) ($settings['tax_percent'] ?? 0);
        $servicePercent = (float) ($settings['service_percent'] ?? 0);

        $subtotal = collect($items)->sum(function ($item) {

            if (empty($item['menu_id'])) {
                $price = $item['price'] ?? 50000;

                Log::info('ITEM BOOKING', [
                    'price' => $price,
                    'qty' => $item['quantity']
                ]);

                return $price * $item['quantity'];
            }

            $menu = Menu::with('discount')->find($item['menu_id']);

            if (!$menu) {
                Log::warning('MENU NOT FOUND', $item);
                return 0;
            }

            if ($menu->discount && $menu->discount->is_active) {
                $price = $menu->price * (1 - $menu->discount->value_discount / 100);
            } else {
                $price = $menu->price;
            }

            // Log::info('ITEM MENU', [
            //     'menu_id' => $menu->id,
            //     'original_price' => $menu->price,
            //     'final_price' => $price,
            //     'qty' => $item['quantity']
            // ]);

            return $price * $item['quantity'];
        });

        $serviceAmount = round(($subtotal * $servicePercent) / 100);
        $taxAmount = round((($subtotal + $serviceAmount) * $taxPercent) / 100);

        $total = $subtotal + $serviceAmount + $taxAmount;

        // Log::info('PRICING RESULT', [
        //     'subtotal' => $subtotal,
        //     'service' => $serviceAmount,
        //     'tax' => $taxAmount,
        //     'total' => $total
        // ]);

        return [
            'subtotal' => (int) round($subtotal),
            'service'  => (int) $serviceAmount,
            'tax'      => (int) $taxAmount,
            'total'    => (int) round($total),
        ];
    }
}
