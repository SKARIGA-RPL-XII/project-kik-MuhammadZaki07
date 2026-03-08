<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use NotificationChannels\WebPush\HasPushSubscriptions;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, HasPushSubscriptions;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $guarded = ['id'];

    public function role()
    {
        return $this->belongsTo(Role::class);
    }
    public function employe()
    {
        return $this->hasOne(Employe::class);
    }

    public function badge()
    {
        return $this->belongsTo(Badge::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function getTotalSpendAttribute()
    {
        return $this->transactions()->where('status', 'completed')->sum('total_amount');
    }

    public function updateBadge()
    {
        $currentSpend = $this->total_spend;

        $eligibleBadge = Badge::where('is_active', true)
            ->where('min_spend', '<=', $currentSpend)
            ->orderBy('min_spend', 'desc')
            ->first();

        if ($eligibleBadge && $this->badge_id !== $eligibleBadge->id) {
            $this->badge_id = $eligibleBadge->id;
            $this->save();
        }
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
