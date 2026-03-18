<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Model;

class MenuAttribute extends Model
{
    use LogsActivity;
    protected $guarded = ['id'];
    protected $table = "menu_attributes";
}
