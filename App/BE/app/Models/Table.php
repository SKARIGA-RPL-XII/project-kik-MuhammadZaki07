<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Table extends Model
{
    protected $guarded = ['id'];
    protected $table = "tables";

    public function room()
    {
        return $this->belongsTo(Room::class);
    }
}
