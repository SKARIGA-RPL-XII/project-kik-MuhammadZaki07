<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserRegistered
{
    use Dispatchable, SerializesModels;

    public $user;
    public $message;

    public function __construct(User $user)
    {
        $this->user = $user;
        $this->message = "Welcome to our family, {$user->username}! Start your culinary journey with us today.";
    }
}
