<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Model;

class Shift extends Model
{
    use LogsActivity;
    protected $fillable = [
        'name',
        'start_time',
        'end_time',
    ];

    public function dutySchedules()
    {
        return $this->hasMany(DutySchedule::class);
    }
}
