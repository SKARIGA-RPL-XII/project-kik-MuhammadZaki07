<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Laravel\Facades\Image;

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
                $oldPath = Setting::get($key);
                if ($oldPath && Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }

                $file = $request->file("settings.$key");
                $filename = 'set-' . $key . '-' . uniqid() . '.webp';
                $directory = 'settings/';
                $fullPath = storage_path('app/public/' . $directory . $filename);

                if (!file_exists(storage_path('app/public/' . $directory))) {
                    mkdir(storage_path('app/public/' . $directory), 0755, true);
                }

                Image::read($file)
                    ->cover(600, 400)
                    ->encodeByExtension('webp', 80)
                    ->save($fullPath);

                Setting::set($key, $directory . $filename, $request->group);
            } else {
                if ($value !== "null" && $value !== null) {
                    $decoded = json_decode($value, true);
                    $finalValue = (json_last_error() === JSON_ERROR_NONE) ? $decoded : $value;

                    Setting::set($key, $finalValue, $request->group);
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
