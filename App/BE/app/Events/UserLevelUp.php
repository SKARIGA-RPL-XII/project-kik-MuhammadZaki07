<?php

namespace App\Events;

use App\Models\User;
use App\Models\Badge;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserLevelUp
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $user;
    public $badge;
    public $message;

    public function __construct(User $user, Badge $badge)
    {
        $this->user = $user;
        $this->badge = $badge;
        $this->message = "Congratulations! You've been promoted to {$badge->name}. Enjoy your new privileges!";
    }
}
