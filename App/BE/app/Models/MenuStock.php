<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Pivot;

class MenuStock extends Pivot {
    public function unit() {
        return $this->belongsTo(Unit::class, 'unit_id');
    }
}
