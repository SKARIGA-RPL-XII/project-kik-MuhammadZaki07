<?php

namespace Database\Seeders;

use App\Models\Employe;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class EmployeSeeder extends Seeder
{
    public function run(): void
    {
        $role = Role::where('name', 'employe')->first();

        if (!$role) {
            $this->command->error('Role employe tidak ditemukan! Pastikan sudah menjalankan RoleSeeder.');
            return;
        }

        $employees = [
            [
                'username' => 'budi_santoso',
                'email' => 'budi@example.com',
                'gender' => 'LK',
                'no_tlp' => '081234567890',
                'addres' => 'Jl. Merdeka No. 10, Jakarta',
            ],
            [
                'username' => 'siti_aminah',
                'email' => 'siti@example.com',
                'gender' => 'PR',
                'no_tlp' => '081298765432',
                'addres' => 'Jl. Mawar No. 5, Bandung',
            ],
            [
                'username' => 'agus_salim',
                'email' => 'agus@example.com',
                'gender' => 'LK',
                'no_tlp' => '081311223344',
                'addres' => 'Jl. Melati No. 22, Surabaya',
            ],
        ];

        foreach ($employees as $index => $data) {
            $user = User::create([
                'username' => $data['username'],
                'email' => $data['email'],
                'password' => Hash::make('password'),
                'role_id' => $role->id,
            ]);

            $prefix = 'EMP-' . now()->format('Ymd');
            $noInduk = $prefix . '-' . str_pad($index + 1, 4, '0', STR_PAD_LEFT);

            Employe::create([
                'user_id' => $user->id,
                'no_induk' => $noInduk,
                'gender' => $data['gender'],
                'no_tlp' => $data['no_tlp'],
                'addres' => $data['addres'],
                'profile_image' => null,
                'identity_card' => null,
            ]);
        }

        $this->command->info('Berhasil membuat 3 data dummy employe dengan password: password');
    }
}
