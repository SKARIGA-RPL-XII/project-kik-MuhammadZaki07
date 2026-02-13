<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Badge extends Model
{
    protected $guarded = ['id'];

    protected $fillable = [
        'badge_image',
        'name',
        'icon',
        'color',
        'is_active'
    ];
}
