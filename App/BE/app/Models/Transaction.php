<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
  protected $fillable = [
    'table_id',
    'user_id',
    'cashier_id',
    'status',
    'total_amount',
    'payment_method',
    'amount_paid',
    'change_amount',
    'order_source',
    'transaction_date',
    'transaction_code',
    'paid_at',
];

    public function details()
    {
        return $this->hasMany(TransactionDetail::class);
    }

    public function table()
    {
        return $this->belongsTo(Table::class);
    }
}
