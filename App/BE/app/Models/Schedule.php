<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Schedule extends Model
{
    use LogsActivity, Notifiable;
    protected $fillable = [
        'user_id',
        'shift_id',
        'date',
        'is_picket',
        'is_holiday',
        'note',
        'day_name'
    ];

    protected $casts = [
        'date' => 'date:Y-m-d',
        'is_picket' => 'boolean',
        'is_holiday' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function shift()
    {
        return $this->belongsTo(Shift::class);
    }

    public function attendance()
    {
        return $this->hasOne(Attendance::class);
    }
}
