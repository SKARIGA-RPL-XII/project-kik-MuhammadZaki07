<?php

namespace App\Models;

use App\Notifications\GeneralNotification;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Booking extends Model
{
    use HasFactory , Notifiable;

    protected static function booted()
    {
        static::created(function ($booking) {
            $cashiers = User::where('role', 'cashier')->get();
            $message = "Booking Baru! Meja {$booking->table->table_number} oleh {$booking->user->username}";

            foreach ($cashiers as $cashier) {
                $cashier->notify(new GeneralNotification($message, 'booking', '/cashier/bookings'));
            }
        });
    }

    protected $fillable = [
        'user_id',
        'table_id',
        'booking_time',
        'number_of_people',
        'status',
        'notes',
        'transaction_id'
    ];

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
