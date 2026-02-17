<?php

namespace App\Imports;

use App\Models\User;
use App\Models\Employe;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class EmployeeImport implements ToModel, WithHeadingRow
{
    private $columnMapping;

    public function __construct(array $columnMapping)
    {
        $this->columnMapping = $columnMapping;
    }

    public function model(array $row)
    {
        $user = User::create([
            'username' => $row[$this->columnMapping['username']],
            'email'    => $row[$this->columnMapping['email']],
            'password' => Hash::make('password123'),
            'role_id'  => $row[$this->columnMapping['role_id']] ?? 2,
        ]);

        return new Employe([
            'user_id' => $user->id,
            'gender'  => $row[$this->columnMapping['gender']],
            'no_tlp'  => $row[$this->columnMapping['no_tlp']],
            'addres'  => $row[$this->columnMapping['addres']],
        ]);
    }
}
