<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    use LogsActivity;
    protected $fillable = [
        'name',
        'color',
        'capacity',
        'width',
        'height'
    ];

    public function tables()
    {
        return $this->hasMany(Table::class);
    }
}
