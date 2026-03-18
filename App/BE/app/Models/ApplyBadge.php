<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Model;

class ApplyBadge extends Model
{
    use LogsActivity;
    protected $guarded = ['id'];
}
