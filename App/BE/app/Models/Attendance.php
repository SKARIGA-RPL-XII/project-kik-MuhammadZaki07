<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Attendance extends Model
{
    use LogsActivity, Notifiable;
    protected $fillable = [
        'user_id',
        'schedule_id',
        'date',
        'clock_in',
        'clock_out',
        'lat_in',
        'long_in',
        'status',
        'total_penalty'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function schedule()
    {
        return $this->belongsTo(Schedule::class);
    }
}
