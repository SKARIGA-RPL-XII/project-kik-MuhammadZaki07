<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AdminController extends Controller
{
    private const ADMIN_ROLE_ID = 1;

    public function index(Request $request)
    {
        $search = $request->query('search');

        $admins = User::where('role_id', self::ADMIN_ROLE_ID)
            ->when($search, function ($query) use ($search) {
                $query->where('email', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(10);

        return response()->json([
            'status' => 'success',
            'message' => 'List admin',
            'data' => $admins
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'email' => [
                'required',
                'email',
                'max:255',
                'unique:users,email'
            ],
            'password' => [
                'required',
                'string',
                'min:6'
            ]
        ]);

        $admin = User::create([
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role_id' => self::ADMIN_ROLE_ID
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Admin created',
            'data' => $admin
        ], 201);
    }

    public function show($id)
    {
        $admin = User::where('role_id', self::ADMIN_ROLE_ID)
            ->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'message' => 'Detail admin',
            'data' => $admin
        ]);
    }

    public function update(Request $request, $id)
    {
        $admin = User::where('role_id', self::ADMIN_ROLE_ID)
            ->findOrFail($id);

        $validated = $request->validate([
            'email' => [
                'sometimes',
                'email',
                'max:255',
                Rule::unique('users')->ignore($admin->id)
            ],
            'password' => [
                'nullable',
                'string',
                'min:6'
            ]
        ]);

        if (isset($validated['email'])) {
            $admin->email = $validated['email'];
        }

        if (!empty($validated['password'])) {
            $admin->password = Hash::make($validated['password']);
        }

        $admin->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Admin updated',
            'data' => $admin
        ]);
    }

    public function destroy($id)
    {
        if (auth()->id() == $id) {
            return response()->json([
                'message' => 'You cannot delete your own account.'
            ], 403);
        }

        $admin = User::where('role_id', 1)->findOrFail($id);
        $admin->delete();

        return response()->json([
            'message' => 'Admin deleted successfully'
        ]);
    }
}
