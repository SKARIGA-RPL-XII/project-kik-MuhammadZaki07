<?php

namespace App\Models;

use App\Notifications\GeneralNotification;
use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Carbon\Carbon;

class Booking extends Model
{
    use HasFactory, Notifiable, LogsActivity;

    protected $fillable = [
        'user_id',
        'table_id',
        'booking_time',
        'end_time',
        'duration_minutes',
        'number_of_people',
        'status',
        'deposit_amount',
        'notes',
        'transaction_id',
        'pending_confirmation'
    ];

    protected $casts = [
        'booking_time' => 'datetime',
        'end_time' => 'datetime',
    ];

    protected static function booted()
    {
        static::created(function ($booking) {
            $cashiers = User::where('role_id', 5)->get();
            $booking->load(['table', 'user']);

            $tableName = $booking->table->table_number ?? "Meja #" . $booking->table_id;
            $customerName = $booking->user->username ?? 'Pelanggan';
            $message = "Booking Baru! {$tableName} oleh {$customerName}";

            foreach ($cashiers as $cashier) {
                $cashier->notify(new GeneralNotification(
                    $message,
                    'booking',
                    '/bookings'
                ));
            }
        });

        static::saving(function ($booking) {
            if (!$booking->end_time && $booking->booking_time) {
                $duration = $booking->duration_minutes ?? 120;
                $booking->end_time = Carbon::parse($booking->booking_time)->addMinutes($duration);
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function table()
    {
        return $this->belongsTo(Table::class);
    }
    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }
}
