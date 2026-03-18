<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use LogsActivity;
    protected $guarded = ['id'];

    // public function getRouteKeyName()
    // {
    //     return 'slug';
    // }

    public function menus(){
        return $this->hasMany(Menu::class);
    }
}
