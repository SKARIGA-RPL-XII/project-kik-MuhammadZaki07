<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Table extends Model
{
    protected $fillable = [
        'table_number',
        'status',
        'qr_code',
        'room_id',
        'capacity',
        'x_position',
        'y_position',
        'width',
        'height',
        'shape',
        'rotation'
    ];

    public function room()
    {
        return $this->belongsTo(Room::class);
    }
}
