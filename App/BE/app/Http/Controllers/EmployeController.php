<?php

namespace App\Http\Controllers;

use App\Exports\EmployeeExport;
use App\Imports\EmployeeImport;
use App\Jobs\ExportEmployeJob;
use App\Models\Employe;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class EmployeController extends Controller
{
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

    public function store(Request $request)
    {
        $request->validate([
            "addres" => "required|string",
            "no_tlp" => "required",
            "profile_image" => "required|file|max:2048|mimes:png,jpg,jpeg,webp",
            "identity_card" => "required|file|max:2048|mimes:png,jpg,jpeg,webp",
            "gender" => "required|in:LK,PR",
            "email" => "required|email|unique:users,email",
            "password" => "required|min:6|confirmed",
            "username" => "required|min:3|string|unique:users,username",
            "role_id" => "required|exists:roles,id",
        ]);

        return DB::transaction(function () use ($request) {
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

            $prefix = 'EMP-' . now()->format('Ymd');
            $count = Employe::where('no_induk', 'like', $prefix . '%')->count();
            $noInduk = $prefix . '-' . str_pad($count + 1, 4, '0', STR_PAD_LEFT);

            Employe::create([
                "addres" => $request->addres,
                "no_tlp" => $request->no_tlp,
                "no_induk" => $noInduk,
                "profile_image" => $PATH_PROFILE_IMAGE,
                "identity_card" => $PATH_IDENTITY_CARD,
                "gender" => $request->gender,
                "user_id" => $user->id
            ]);

            return Controller::OKE('success', 'success create data', [], 201);
        });
    }

    public function update(Request $request, Employe $employe)
    {
        $request->validate([
            "addres" => "sometimes|string",
            "no_tlp" => "sometimes",
            "profile_image" => "sometimes|file|max:2048|mimes:png,jpg,jpeg,webp",
            "identity_card" => "sometimes|file|max:2048|mimes:png,jpg,jpeg,webp",
            "gender" => "sometimes|in:LK,PR",
            "email" => "sometimes|email|unique:users,email," . $employe->user_id,
            "username" => "sometimes|string|min:3|unique:users,username," . $employe->user_id,
            "password" => "nullable|min:6|confirmed",
            "role_id" => "sometimes|exists:roles,id",
        ]);

        DB::transaction(function () use ($request, $employe) {
            $user = $employe->user;

            if ($request->filled('role_id')) {
                $role = Role::whereIn('name', ['employe', 'cashier'])
                    ->where('id', $request->role_id)
                    ->first();

                if ($role) {
                    $user->role_id = $role->id;
                }
            }

            if ($request->filled('email')) $user->email = $request->email;
            if ($request->filled('username')) $user->username = $request->username;
            if ($request->filled('password')) $user->password = Hash::make($request->password);

            $user->save();

            $data = $request->only(['addres', 'no_tlp', 'gender']);

            if ($request->hasFile('profile_image')) {
                if ($employe->profile_image) Storage::disk('public')->delete($employe->profile_image);
                $data['profile_image'] = $request->file('profile_image')->store('profile_images', 'public');
            }

            if ($request->hasFile('identity_card')) {
                if ($employe->identity_card) Storage::disk('public')->delete($employe->identity_card);
                $data['identity_card'] = $request->file('identity_card')->store('identity_card', 'public');
            }

            $employe->update($data);
        });

        return Controller::OKE('success', 'success updated data', $employe->load('user'), 200);
    }

    public function destroy(Employe $employe)
    {
        return DB::transaction(function () use ($employe) {
            if ($employe->profile_image) Storage::disk('public')->delete($employe->profile_image);
            if ($employe->identity_card) Storage::disk('public')->delete($employe->identity_card);

            $user = $employe->user;
            $employe->delete();
            if ($user) $user->delete();

            return Controller::OKE('success', 'success delete', [], 200);
        });
    }

    public function export()
    {
        $userId = Auth::user()->id;

        ExportEmployeJob::dispatch($userId);

        return Controller::OKE(
            'success',
            'Proses export dimulai. Silakan cek notifikasi Anda beberapa saat lagi.'
        );
    }

    public function import(Request $request)
    {
        $request->validate([
            'data' => 'required|array',
            'data.*.email' => 'required|email|unique:users,email',
            'data.*.username' => 'required|string|min:3',
            'data.*.gender' => 'required|in:LK,PR',
        ]);

        $employeRole = Role::where('name', 'employe')->first();

        if (!$employeRole) {
            return Controller::ERROR('error', 'Role employe tidak ditemukan di database', 404);
        }

        DB::transaction(function () use ($request, $employeRole) {
            foreach ($request->data as $item) {
                $user = User::create([
                    'email' => $item['email'],
                    'username' => $item['username'],
                    'password' => Hash::make('password123'),
                    'role_id' => $employeRole->id,
                ]);

                $prefix = 'EMP-' . now()->format('Ymd');
                $count = Employe::where('no_induk', 'like', $prefix . '%')->count();
                $noInduk = $prefix . '-' . str_pad($count + 1, 4, '0', STR_PAD_LEFT);

                Employe::create([
                    'user_id' => $user->id,
                    'no_induk' => $noInduk,
                    'gender'  => $item['gender'],
                    'no_tlp'  => $item['no_tlp'] ?? '-',
                    'addres'  => $item['addres'] ?? '-',
                ]);
            }
        });

        return Controller::OKE('success', count($request->data) . ' data employee berhasil diimport.');
    }
}
