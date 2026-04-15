<?php

namespace Database\Seeders;

use App\Models\Employe;
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

                $user = User::updateOrCreate(
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

                if (in_array($roleName, ['cashier', 'employe'])) {
                    Employe::updateOrCreate(
                        ['user_id' => $user->id],
                        [
                            'no_induk' => 'EMP-' . now()->format('Ymd') . '-' . str_pad($user->id, 4, '0', STR_PAD_LEFT),
                            'gender' => 'LK',
                            'no_tlp' => '08xxxxxxxxxx',
                            'addres' => 'Auto generated',
                        ]
                    );
                }
            }
        }
    }
}
