<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Model;

class Stock extends Model
{
    use LogsActivity;
    protected $guarded = ['id'];
    public function menus()
    {
        return $this->belongsToMany(Menu::class, 'menu_stocks');
    }

    public function attributeLevels()
    {
        return $this->hasMany(AttributeLevel::class);
    }
}
