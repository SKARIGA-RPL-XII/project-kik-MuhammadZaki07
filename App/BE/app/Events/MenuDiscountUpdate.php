<?php

namespace App\Events;

use App\Models\Menu;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MenuDiscountUpdate
{
    use Dispatchable, SerializesModels;

    public $menu;
    public $message;

    public function __construct(Menu $menu)
    {
        $this->menu = $menu;
        $this->message = "Price Drop Alert! '{$menu->name}' is now on sale. Grab it before it's gone!";
    }
}
