<?php

namespace App\Exports;

use App\Models\Employe;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class EmployeeExport implements FromQuery, WithHeadings, WithMapping
{
    public function query()
    {
        return Employe::with(['user.role']);
    }

    public function headings(): array
    {
        return [
            'Username',
            'Email',
            'Role',
            'Gender',
            'Phone',
            'Address',
        ];
    }

    public function map($employe): array
    {
        return [
            $employe->user->username,
            $employe->user->email,
            $employe->user->role->name,
            $employe->gender,
            $employe->no_tlp,
            $employe->addres,
        ];
    }
}
