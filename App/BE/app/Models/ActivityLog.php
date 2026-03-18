<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ActivityLog extends Model
{
    use SoftDeletes;

    protected $table = "activity_logs";

    protected $fillable = [
        'user_id',
        'action',
        'module',
        'payload_before',
        'payload_after',
        'ip_address',
        'message'
    ];

    protected $casts = [
        'payload_before' => 'array',
        'payload_after' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
