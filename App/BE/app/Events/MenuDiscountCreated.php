<?php

namespace App\Events;

use App\Models\Menu;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MenuDiscountCreated
{
    use Dispatchable, SerializesModels;

    public $menu;
    public $message;

    public function __construct(Menu $menu)
    {
        $this->menu = $menu;
        $this->message = "Flash Sale! New menu '{$menu->name}' is now available with a special discount.";
    }
}
