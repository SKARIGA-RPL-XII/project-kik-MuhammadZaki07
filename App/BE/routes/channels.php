<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('notifications.user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('notifications.role.{roleId}', function ($user, $roleId) {
    return (int) $user->role_id === (int) $roleId;
});

Broadcast::channel('notifications.global', function () {
    return true;
});
