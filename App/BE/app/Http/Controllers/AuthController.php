<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|min:6',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return Controller::ERROR(
                'login_failed',
                'Incorrect email or password',
                401
            );
        }

        $token = $user->createToken('token')->plainTextToken;
        $user->role_name = $user->role->name;
        unset($user->role);

        return Controller::OKE(
            'success',
            'login success',
            [
                "user" => $user,
                'token' => $token,
                'personal_data' => $user->employee,
            ],
            200
        );
    }


    public function register(Request $request)
    {
        $request->validate([
            "email" => "required|unique:users,email",
            "password" => "required|min:6|confirmed",
            "username" => "required|min:3|string",
            "gender" => "required|in:LK,PR",
        ]);

        $user = User::create([
            "email" => $request->email,
            "password" => Hash::make($request->password),
            "username" => $request->username,
            "role_id" => 4,
            "gender" => $request->gender,
        ]);

        $token = $user->createToken('token')->plainTextToken;
        $user['token'] = $token;

        return Controller::OKE('success', 'register success', $user, 201);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return Controller::OKE('success', 'logout success', [], 200);
    }
}
