<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $roles = ['admin', 'cashier', 'employe'];

        foreach ($roles as $roleName) {

            $role = Role::where('name', $roleName)->first();

            if (!$role) {
                continue;
            }

            for ($i = 1; $i <= 5; $i++) {
                User::updateOrCreate(
                    [
                        'email' => "{$roleName}{$i}@gmail.com"
                    ],
                    [
                        'username' => ucfirst($roleName) . " {$i}",
                        'role_id' => $role->id,
                        'password' => Hash::make('password'),
                        'email_verified_at' => now(),
                        'remember_token' => Str::random(10),
                    ]
                );
            }
        }
    }
}
