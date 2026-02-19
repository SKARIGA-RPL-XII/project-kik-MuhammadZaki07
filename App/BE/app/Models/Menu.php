<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Menu extends Model
{
    protected $guarded = ['id'];


    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function discount()
    {
        return $this->belongsTo(Discount::class);
    }

    public function attributes()
    {
        return $this->belongsToMany(Attribute::class, 'menu_attributes')
            ->withPivot('attribute_level_id')
            ->withTimestamps();
    }


    public function stocks()
    {
        return $this->belongsToMany(Stock::class, 'menu_stocks')
            ->withPivot('amount')
            ->withTimestamps();
    }

    public $hidden = ['category_id', 'discount_id'];
}
