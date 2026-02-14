<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attribute extends Model
{
    protected $fillable = ['name'];

    public function levels()
    {
        return $this->hasMany(AttributeLevel::class);
    }
}
