<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $notifications = DB::table('notifications')
            ->where('notifiable_id', $user->id)
            ->where('notifiable_type', 'App\Models\User')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($notif) {
                return [
                    'id' => $notif->id,
                    'type' => $notif->type,
                    'data' => json_decode($notif->data, true),
                    'read_at' => $notif->read_at,
                    'created_at' => $notif->created_at,
                ];
            });

        return response()->json($notifications);
    }

    public function markAllRead(Request $request)
    {
        $user = $request->user();
        DB::table('notifications')
            ->where('notifiable_id', $user->id)
            ->where('notifiable_type', 'App\Models\User')
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['message' => 'Toutes les notifications ont été marquées comme lues.']);
    }

    public function markRead(Request $request, $id)
    {
        $user = $request->user();
        DB::table('notifications')
            ->where('id', $id)
            ->where('notifiable_id', $user->id)
            ->update(['read_at' => now()]);

        return response()->json(['message' => 'Notification marquée comme lue.']);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        DB::table('notifications')
            ->where('id', $id)
            ->where('notifiable_id', $user->id)
            ->delete();

        return response()->json(null, 204);
    }
}
