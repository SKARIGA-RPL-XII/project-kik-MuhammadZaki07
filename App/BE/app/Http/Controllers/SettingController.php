<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;

class SettingController extends Controller
{
    /**
     * Get all settings as key-value pair
     */
    public function index()
    {
        $settings = Setting::all()->pluck('value', 'key');

        return response()->json([
            'status' => true,
            'message' => 'Settings retrieved successfully',
            'data' => $settings
        ]);
    }

    /**
     * Update multiple settings at once
     */
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'store_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'theme' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'sidebar_config' => 'nullable|array',
            'pages_config' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        foreach ($request->all() as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => is_array($value) ? json_encode($value) : $value]
            );

            Cache::forget("setting_{$key}");
        }

        return response()->json([
            'status' => true,
            'message' => 'Settings updated successfully'
        ]);
    }

    /**
     * Get single setting by key
     */
    public function show($key)
    {
        $setting = Setting::where('key', $key)->first();

        if (!$setting) {
            return response()->json([
                'status' => false,
                'message' => 'Setting not found'
            ], 404);
        }

        return response()->json([
            'status' => true,
            'data' => [
                $setting->key => $setting->value
            ]
        ]);
    }

    /**
     * Delete a setting (optional – usually restricted)
     */
    public function destroy($key)
    {
        $setting = Setting::where('key', $key)->first();

        if (!$setting) {
            return response()->json([
                'status' => false,
                'message' => 'Setting not found'
            ], 404);
        }

        $setting->delete();
        Cache::forget("setting_{$key}");

        return response()->json([
            'status' => true,
            'message' => 'Setting deleted successfully'
        ]);
    }
}
