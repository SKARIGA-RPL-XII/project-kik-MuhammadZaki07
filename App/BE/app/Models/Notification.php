<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Notification extends Model
{
    use SoftDeletes , LogsActivity;

    protected $primaryKey = 'id';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'type',
        'title',
        'message',
        'data',
        'user_id',
        'role_id',
        'is_global',
        'read_at',
    ];

    protected $casts = [
        'data' => 'array',
        'is_global' => 'boolean',
        'read_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = (string) Str::uuid();
            }
        });

        static::created(function ($notification) {
            $user = $notification->user;

            if ($user) {
                $payload = [
                    'id' => $notification->id,
                    'title' => $notification->title,
                    'body' => $notification->message,
                ];

                $user->notify(new \App\Notifications\PushTestNotification($payload));
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }
}
