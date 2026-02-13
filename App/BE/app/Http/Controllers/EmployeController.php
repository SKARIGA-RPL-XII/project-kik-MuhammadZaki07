<?php

namespace App\Http\Controllers;

use App\Models\Employe;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class EmployeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->query('search');
        $gender = $request->query('gender');
        $roleId = $request->query('role_id');

        $page = max(1, (int) $request->query('page', 1));
        $size = (int) $request->query('size', 10);

        $query = Employe::with(['user.role'])
            ->when($search, function ($q) use ($search) {
                $q->whereHas('user', function ($sub) use ($search) {
                    $sub->where('username', 'like', "%{$search}%");
                });
            })
            ->when($gender, function ($q) use ($gender) {
                $q->where('gender', $gender);
            })
            ->when($roleId, function ($q) use ($roleId) {
                $q->whereHas('user', function ($sub) use ($roleId) {
                    $sub->where('role_id', $roleId);
                });
            });

        $total = $query->count();

        $data = $query
            ->latest()
            ->skip(($page - 1) * $size)
            ->take($size)
            ->get();

        return Controller::OKE(
            'success',
            'success get data',
            [
                "employes" => $data,
                "metadata" => [
                    "page" => $page,
                    "size" => $size,
                    "total" => $total
                ]
            ],
            200
        );
    }



    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            "addres" => "required|string",
            "no_tlp" => "required",
            "profile_image" => "required|file|max:2040|mimes:png,jpg,jpeg,webp",
            "identity_card" => "required|file|max:2040|mimes:png,jpg,jpeg,webp",
            "gender" => "required|in:LK,PR",
            "email" => "required|email|unique:users,email",
            "password" => "required|min:6|confirmed",
            "username" => "required|min:3|string|unique:users,username",
            "role_id" => "required|exists:roles,id",
        ]);

        $role = Role::whereIn('name', ['employe', 'cashier'])
            ->where('id', $request->role_id)
            ->first();

        if (!$role) {
            return Controller::ERROR('error', 'Invalid role selected', 400);
        }

        $PATH_PROFILE_IMAGE = $request->file('profile_image')->store('profile_images', 'public');
        $PATH_IDENTITY_CARD = $request->file('identity_card')->store('identity_card', 'public');

        $user = User::create([
            "email" => $request->email,
            "password" => Hash::make($request->password),
            "username" => $request->username,
            "role_id" => $role->id
        ]);

        Employe::create([
            "addres" => $request->addres,
            "no_tlp" => (int) $request->no_tlp,
            "profile_image" => $PATH_PROFILE_IMAGE,
            "identity_card" => $PATH_IDENTITY_CARD,
            "gender" => $request->gender,
            "user_id" => $user->id
        ]);

        return Controller::OKE('success', 'success create data', [], 201);
    }


    /**
     * Display the specified resource.
     */
    public function show(Employe $employe)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Employe $employe)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Employe $employe)
    {
        $request->validate([
            "addres" => "sometimes|string",
            "no_tlp" => "sometimes",
            "profile_image" => "sometimes|file|max:2040|mimes:png,jpg,jpeg,webp",
            "identity_card" => "sometimes|file|max:2040|mimes:png,jpg,jpeg,webp",
            "gender" => "sometimes|in:LK,PR",
            "email" => "sometimes|email|unique:users,email," . $employe->user_id,
            "username" => "sometimes|string|min:3|unique:users,username," . $employe->user_id,
            "password" => "nullable|min:6|confirmed",
            "role_id" => "sometimes|exists:roles,id",
        ]);

        $user = $employe->user;

        if ($request->filled('role_id')) {
            $role = Role::whereIn('name', ['employe', 'cashier'])
                ->where('id', $request->role_id)
                ->first();

            if (!$role) {
                return Controller::ERROR('error', 'Invalid role selected', 400);
            }

            $user->role_id = $role->id;
        }

        if ($request->filled('email')) {
            $user->email = $request->email;
        }

        if ($request->filled('username')) {
            $user->username = $request->username;
        }

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        $data = $request->only(['addres', 'no_tlp', 'gender']);

        if ($request->hasFile('profile_image')) {
            if ($employe->profile_image) {
                Storage::disk('public')->delete($employe->profile_image);
            }

            $data['profile_image'] = $request->file('profile_image')
                ->store('profile_images', 'public');
        }

        if ($request->hasFile('identity_card')) {
            if ($employe->identity_card) {
                Storage::disk('public')->delete($employe->identity_card);
            }

            $data['identity_card'] = $request->file('identity_card')
                ->store('identity_card', 'public');
        }

        $employe->update($data);

        return Controller::OKE('success', 'success updated data', $employe->load('user'), 200);
    }



    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Employe $employe)
    {
        if ($employe->profile_image) {
            Storage::disk('public')->delete($employe->profile_image);
        }

        if ($employe->identity_card) {
            Storage::disk('public')->delete($employe->identity_card);
        }

        $user = $employe->user;

        $employe->delete();

        if ($user) {
            $user->delete();
        }

        return Controller::OKE('success', 'success delete', [], 200);
    }
}
