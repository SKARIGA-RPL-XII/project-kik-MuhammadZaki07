<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TransactionDetailResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'menu_qty' => $this->menu_qty,
            'price' => $this->price,
            'subtotal' => $this->subtotal,
            'attributes' => $this->attributes,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'menu' => [
                'name' => $this->menu->name,
                'image' => $this->menu->menu_image,
            ],
            'transaction' => [
                'code' => $this->transaction->transaction_code,
                'customer' => $this->transaction->customer_name,
                'status' => $this->transaction->status,
                'method' => $this->transaction->payment_method,
                'source' => $this->transaction->order_source,
                'table' => $this->transaction->table ? $this->transaction->table->table_number : 'Take Away',
                'user' => $this->transaction->user ? [
                    'name' => $this->transaction->user->name,
                    'email' => $this->transaction->user->email,
                ] : null,
                'cashier' => $this->transaction->cashier ? $this->transaction->cashier->name : 'Self Service',
            ],
        ];
    }
}
