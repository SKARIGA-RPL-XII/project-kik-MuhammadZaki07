<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use LogsActivity;
    protected $guarded = ['id'];

    public $hidden = ['id' , 'created_at' , 'updated_at'];
}
