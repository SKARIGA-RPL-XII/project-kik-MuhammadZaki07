<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Unit extends Model
{
    protected $fillable = ['name', 'abbreviation', 'category', 'base_unit_id', 'multiplier'];

    public function baseUnit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'base_unit_id');
    }

    public function childUnits(): HasMany
    {
        return $this->hasMany(Unit::class, 'base_unit_id');
    }

    public function isBase(): bool
    {
        return $this->base_unit_id === null || $this->id === $this->base_unit_id;
    }

    public function convertToBase($amount)
    {
        return $amount * $this->multiplier;
    }

    public function convertFromBase($amountInBase)
    {
        return $amountInBase / $this->multiplier;
    }
}
