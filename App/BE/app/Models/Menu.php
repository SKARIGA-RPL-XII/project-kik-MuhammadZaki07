<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Menu extends Model
{
    protected $guarded = ['id'];


    public function category(){
        return $this->belongsTo(Category::class);
    }

    public function discount(){
        return $this->belongsTo(Discount::class);
    }

    public $hidden = ['category_id' , 'discount_id'];
}
