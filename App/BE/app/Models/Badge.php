<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Model;

class Badge extends Model
{
    use LogsActivity;
    protected $guarded = ['id'];

    protected $fillable = [
        'badge_image',
        'name',
        'icon',
        'color',
        'is_active',
        'min_spend'
    ];
}
