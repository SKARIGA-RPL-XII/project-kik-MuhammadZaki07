<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
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
