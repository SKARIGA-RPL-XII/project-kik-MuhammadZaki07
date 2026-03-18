<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Model;

class Employe extends Model
{
    use LogsActivity;
    protected $guarded = ['id'];

    public function user(){
        return $this->belongsTo(User::class);
    }

    public $hidden = ['created_at' , 'updated_at', 'user_id'];
}
