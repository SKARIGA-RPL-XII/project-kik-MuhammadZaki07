<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Model;

class TransactionDetail extends Model
{
    use LogsActivity;
    protected $guarded = ['id'];

    protected $casts = [
        'attributes' => 'array',
    ];

    public function menu()
    {
        return $this->belongsTo(Menu::class);
    }

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }
}
