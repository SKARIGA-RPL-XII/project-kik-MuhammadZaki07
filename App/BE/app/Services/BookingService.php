<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Menu;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BookingService
{
    public function __construct(
        protected PricingService $pricingService,
        protected TransactionService $transactionService,
        protected PosService $posService
    ) {}

    public function confirm(Booking $booking): Booking
    {
        return DB::transaction(function () use ($booking) {

            $booking = Booking::with(['table', 'transaction'])
                ->lockForUpdate()
                ->findOrFail($booking->id);

            if ($booking->status === 'confirmed') {
                return $booking;
            }

            $booking->update([
                'status' => 'confirmed'
            ]);

            if ($booking->table) {
                $booking->table->update([
                    'status' => 'booked'
                ]);
            }

            return $booking;
        });
    }

    public function create(array $data): array
    {
        return DB::transaction(function () use ($data) {

            $this->ensureAvailable(
                $data['table_id'],
                $data['booking_time']
            );

            $settings = [
                'tax_percent' => $data['settings']['tax_percent'] ?? 0,
                'service_percent' => $data['settings']['service_percent'] ?? 0,
            ];

            $items = $data['items'] ?? [];

            $isOnlyBooking = empty($items);

            if ($isOnlyBooking) {
                $settings['tax_percent'] = 0;
                $settings['service_percent'] = 0;

                $pricing = [
                    'subtotal' => 50000,
                    'service' => 0,
                    'tax' => 0,
                    'total' => 50000,
                ];
            } else {
                $pricing = $this->pricingService->calculate($items, $settings);
            }

            $transaction = $this->transactionService->create($data, $pricing);

            foreach ($items as $item) {
                if (empty($item['menu_id'])) continue;

                $menu = Menu::with('discount')->find($item['menu_id']);
                if (!$menu) continue;

                $price = $menu->final_price;

                DB::table('transaction_details')->insert([
                    'transaction_id' => $transaction->id,
                    'menu_id' => $menu->id,
                    'menu_qty' => $item['quantity'],
                    'price' => $price,
                    'subtotal' => $price * $item['quantity'],
                    'attributes' => json_encode($item['attributes'] ?? null),
                    'status' => 'pending',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            $snapToken = null;

            if (($data['payment_method'] ?? null) !== 'cash') {
                $snapToken = $this->posService->generateMidtransToken(
                    $transaction,
                    $pricing,
                    $items,
                    $settings
                );

                $transaction->update([
                    'snap_token' => $snapToken
                ]);
            }

            $booking = Booking::create([
                'user_id' => auth()->id(),
                'table_id' => $data['table_id'],
                'booking_time' => Carbon::parse($data['booking_time']),
                'end_time' => Carbon::parse($data['booking_time'])->addMinutes(120),
                'number_of_people' => $data['number_of_people'],
                'transaction_id' => $transaction->id,
                'status' => 'pending_confirmation',
                'notes' => $data['notes'] ?? null,
            ]);

            return [
                'booking' => $booking,
                'transaction' => $transaction->load('details.menu'),
                'pricing' => $pricing,
                'snap_token' => $snapToken
            ];
        });
    }

    private function ensureAvailable($tableId, $startTime): void
    {
        $start = Carbon::parse($startTime);
        $end = $start->copy()->addMinutes(120);

        $exists = Booking::where('table_id', $tableId)
            ->whereIn('status', ['pending_confirmation', 'confirmed'])
            ->where(function ($q) use ($start, $end) {
                $q->where('booking_time', '<', $end)
                    ->where('end_time', '>', $start);
            })
            ->exists();

        if ($exists) {
            throw new \Exception("Table already booked for this time slot");
        }
    }
}
