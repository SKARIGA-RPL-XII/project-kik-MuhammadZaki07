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
        'customer_name'
    ];

    public function details()
    {
        return $this->hasMany(TransactionDetail::class);
    }

    public function table()
    {
        return $this->belongsTo(Table::class);
    }


    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
