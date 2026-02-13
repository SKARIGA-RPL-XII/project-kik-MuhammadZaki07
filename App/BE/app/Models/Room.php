<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    protected $fillable = ['name', 'capacity'];

     public function tables()
    {
        return $this->hasMany(Table::class);
    }
}
