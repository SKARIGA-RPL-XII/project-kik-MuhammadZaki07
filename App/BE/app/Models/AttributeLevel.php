<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AttributeLevel extends Model
{
    protected $fillable = ['attribute_id', 'name'];

    public function attribute()
    {
        return $this->belongsTo(Attribute::class);
    }
}
