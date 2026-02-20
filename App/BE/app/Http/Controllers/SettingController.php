<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class SettingController extends Controller
{
    public function index(Request $request)
    {
        $group = $request->query('group');

        $query = Setting::query();

        if ($group) {
            $query->where('group', $group);
        }

        $settings = $query->get()->mapWithKeys(function ($item) {
            return [$item->key => [
                'value' => Setting::get($item->key),
                'type' => $item->type,
                'group' => $item->group
            ]];
        });

        return response()->json($settings);
    }

    // public function updateBulk(Request $request)
    // {
    //     $request->validate([
    //         'settings' => 'required|array',
    //         'group' => 'required|string'
    //     ]);

    //     foreach ($request->settings as $key => $value) {
    //         Setting::set($key, $value, $request->group);
    //     }

    //     return response()->json([
    //         'message' => 'Settings updated successfully',
    //         'data' => $this->getSettingsByGroup($request->group)
    //     ]);
    // }


    public function updateBulk(Request $request)
    {
        $request->validate([
            'settings' => 'required|array',
            'group' => 'required|string'
        ]);

        foreach ($request->settings as $key => $value) {
            if ($request->hasFile("settings.$key")) {
                $file = $request->file("settings.$key");
                $path = $file->store('settings', 'public');

                Setting::set($key, $path, $request->group);
            } else {
                if ($value !== "null" && $value !== null) {
                    Setting::set($key, $value, $request->group);
                }
            }
        }

        return response()->json([
            'message' => 'Settings updated successfully',
            'data' => $this->getSettingsByGroup($request->group)
        ]);
    }
    private function getSettingsByGroup(string $group)
    {
        return Setting::where('group', $group)->get()->pluck('value', 'key');
    }

    public function show($key)
    {
        return response()->json([
            'key' => $key,
            'value' => Setting::get($key)
        ]);
    }

    public function destroy($key)
    {
        Setting::where('key', $key)->delete();
        Cache::forget("setting_{$key}");
        return response()->json(['message' => 'Setting deleted']);
    }
}
