<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    public function updateProfile(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            "email" => "sometimes|email|unique:users,email," . $id,
            "password" => "sometimes|nullable|string|min:6",
            "no_tlp" => "sometimes|nullable|string|unique:users,no_tlp," . $id,
            "addres" => "sometimes|nullable|string",
            "gender" => "sometimes|in:LK,PR",
            "profile_image" => "sometimes|nullable|file|mimes:png,jpg,jpeg,webp|max:2048",
            "username" => "sometimes|string",
        ]);

        if ($request->filled('password')) {
            $validated['password'] = Hash::make($request->password);
        } else {
            unset($validated['password']);
        }

        if ($request->hasFile('profile_image')) {
            if ($user->profile_image) {
                Storage::disk('public')->delete($user->profile_image);
            }

            $validated['profile_image'] = $request
                ->file('profile_image')
                ->store('profile_images', 'public');
        }

        $user->update($validated);

        $user->profile_image = $user->profile_image ? asset('storage/' . $user->profile_image) : null;

        return response()->json([
            'status' => 'success',
            'message' => 'Profile updated successfully',
            'data' => $user
        ], 200);
    }

    public function me(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                "status" => "error",
                "message" => "User not found",
            ], 404);
        }

        return response()->json([
            "status" => "success",
            "data" => [
                "id" => $user->id,
                "username" => $user->username,
                "email" => $user->email,
                "no_tlp" => $user->no_tlp,
                "addres" => $user->addres,
                "gender" => $user->gender,
                "profile_image" => $user->profile_image ? asset('storage/' . $user->profile_image) : null,
            ],
        ], 200);
    }
}
