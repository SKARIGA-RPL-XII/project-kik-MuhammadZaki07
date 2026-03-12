<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        $query = Notification::where(function ($q) use ($user) {
            $q->where('notifiable_id', $user->id)
                ->orWhere('role_id', $user->role_id)
                ->orWhere('is_global', true);
        });

        $notifications = $query->latest()->paginate($request->query('size', 10));

        return Controller::OKE('success', 'success get notifications', [
            'notifications' => $notifications->items(),
            'metadata' => [
                'page' => $notifications->currentPage(),
                'size' => $notifications->perPage(),
                'total' => $notifications->total(),
                'last_page' => $notifications->lastPage(),
                'unread_count' => (clone $query)->whereNull('read_at')->count()
            ]
        ], 200);
    }

    public function show($id)
    {
        $notification = Notification::findOrFail($id);

        if (!$notification->read_at) {
            $notification->update(['read_at' => now()]);
        }

        return Controller::OKE('success', 'success get notification detail', $notification, 200);
    }

    public function markAsRead($id)
    {
        $notification = Notification::findOrFail($id);
        $notification->update(['read_at' => now()]);

        return Controller::OKE('success', 'read', [], 200);
    }

    public function markAllAsRead(Request $request)
    {
        $user = Auth::user();

        Notification::where(function ($q) use ($user) {
            $q->where('user_id', $user->id)
                ->orWhere('role_id', $user->role_id);
        })
        ->whereNull('read_at')
        ->update(['read_at' => now()]);

        return Controller::OKE('success', 'All notifications marked as read', [], 200);
    }

    public function destroy($id)
    {
        $notification = Notification::findOrFail($id);
        $notification->delete();

        return Controller::OKE('success', 'deleted', [], 200);
    }

    public function subscribe(Request $request)
    {
        $request->validate([
            'endpoint' => 'required',
            'keys.auth' => 'required',
            'keys.p256dh' => 'required'
        ]);

        $request->user()->updatePushSubscription(
            $request->endpoint,
            $request->keys['p256dh'],
            $request->keys['auth']
        );

        return response()->json(['message' => 'Subscription successful']);
    }
}
