<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Model;

class Menu extends Model
{
    use LogsActivity;
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

    public function attributeLevels()
    {
        return $this->belongsToMany(AttributeLevel::class, 'menu_attribute_level', 'menu_id', 'attribute_level_id')
            ->withPivot('price')
            ->withTimestamps();
    }

    public function ingredients()
    {
        return $this->belongsToMany(Stock::class, 'menu_ingredients')
            ->withPivot('quantity_needed')
            ->withTimestamps();
    }

    // public function getCalculatedStockAttribute()
    // {
    //     $ingredients = $this->stocks;
    //     if ($ingredients->isEmpty()) return 0;

    //     $availablePortions = [];
    //     foreach ($ingredients as $ingredient) {
    //         $portions = floor($ingredient->quantity / $ingredient->pivot->amount);
    //         $availablePortions[] = $portions;
    //     }

    //     return min($availablePortions);
    // }

    public function getCalculatedStockAttribute()
    {
        $ingredients = $this->stocks;
        if ($ingredients->isEmpty()) return 0;

        $availablePortions = [];
        foreach ($ingredients as $ingredient) {
            $neededAmount = $ingredient->pivot->amount;

            if ($neededAmount > 0) {
                $portions = floor($ingredient->quantity / $neededAmount);
                $availablePortions[] = $portions;
            } else {
                $availablePortions[] = 0;
            }
        }

        return empty($availablePortions) ? 0 : min($availablePortions);
    }

    public function getFinalPriceAttribute()
    {
        if (!$this->discount || !$this->discount->is_active || now() > $this->discount->end_date) {
            return $this->price;
        }

        return $this->price - ($this->price * $this->discount->value_discount / 100);
    }


    public $hidden = ['category_id', 'discount_id'];
}
