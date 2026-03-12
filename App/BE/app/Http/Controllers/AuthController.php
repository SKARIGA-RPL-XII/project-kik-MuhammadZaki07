<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Events\UserRegistered;
use App\Notifications\GeneralNotification;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\GoogleProvider;

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

        $event = new UserRegistered($user);
        $user->notify(new GeneralNotification(
            $event->message,
            'welcome',
            '/profile'
        ));

        $token = $user->createToken('token')->plainTextToken;
        $user['token'] = $token;

        return Controller::OKE('success', 'register success', $user, 201);
    }
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return Controller::OKE('success', 'logout success', [], 200);
    }

    public function googleLogin(Request $request)
    {
        $request->validate([
            'token' => 'required|string'
        ]);

        try {
            $driver = Socialite::buildProvider(
                GoogleProvider::class,
                config('services.google')
            );

            $googleUser = $driver->stateless()->userFromToken($request->token);

            $email = $googleUser->getEmail();
            $avatar = $googleUser->getAvatar();
            $googleId = $googleUser->getId();

            $user = User::where('google_id', $googleId)
                ->orWhere('email', $email)
                ->first();

            if (!$user) {
                $user = User::create([
                    'google_id' => $googleId,
                    'username' => $googleUser->getName(),
                    'email' => $email,
                    'profile_image' => $avatar,
                    'role_id' => 4,
                    'password' => Hash::make(Str::random(24)),
                    'gender' => null,
                ]);

                event(new UserRegistered($user));
            } else {
                $updateData = [];
                if (!$user->google_id) {
                    $updateData['google_id'] = $googleId;
                }

                if (!$user->profile_image || str_contains($user->profile_image, 'storage')) {
                    $updateData['profile_image'] = $avatar;
                }

                if (!empty($updateData)) {
                    $user->update($updateData);
                }
            }

            $token = $user->createToken('token')->plainTextToken;
            $user->load('role');

            return Controller::OKE(
                'success',
                'Google login success',
                [
                    'user' => [
                        ...$user->toArray(),
                        'role_name' => $user->role->name
                    ],
                    'token' => $token
                ],
                200
            );
        } catch (Exception $e) {
            return Controller::ERROR('google_error', $e->getMessage(), 401);
        }
    }
}
