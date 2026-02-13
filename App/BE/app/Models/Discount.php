<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Discount extends Model
{
    protected $guarded = ['id'];

    public function menus(){
        return $this->hasMany(Menu::class);
    }

    public $hidden = ['created_at','updated_at'];
}
