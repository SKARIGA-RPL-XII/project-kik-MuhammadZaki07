<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Shift extends Model
{
    use LogsActivity, Notifiable;
    protected $fillable = [
        'name',
        'start_time',
        'end_time',
        'late_tolerance',
        'late_penalty'
    ];

    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }
}
