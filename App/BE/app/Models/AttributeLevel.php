<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Model;

class AttributeLevel extends Model
{
    use LogsActivity;
    protected $fillable = ['attribute_id', 'name'];

    public function attribute()
    {
        return $this->belongsTo(Attribute::class);
    }


    public function stocks()
    {
        return $this->belongsToMany(Stock::class, 'attribute_level_stocks')
            ->withPivot('unit_id', 'amount')
            ->withTimestamps();
    }
}
