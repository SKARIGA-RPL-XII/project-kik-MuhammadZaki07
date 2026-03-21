<?php

namespace  App\Services;

use App\Models\Booking;
use Carbon\Carbon;

class BookingService
{
    public function checkAvailability($tableId, $startTime, $durationMinutes = 120)
    {
        $start = Carbon::parse($startTime);
        $end = $start->copy()->addMinutes($durationMinutes);

        $overlap = Booking::where('table_id', $tableId)
            ->whereIn('status', ['confirmed', 'pending'])
            ->where(function ($query) use ($start, $end) {
                $query->where('booking_time', '<', $end)
                    ->where('end_time', '>', $start);
            })
            ->exists();

        return !$overlap;
    }
}
