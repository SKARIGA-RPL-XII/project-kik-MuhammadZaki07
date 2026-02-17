<?php

namespace App\Exports;

use App\Models\User;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class AdminExport implements FromCollection, WithHeadings, WithMapping
{
    public function collection()
    {
        return User::where('role_id', 1)->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Username',
            'Email',
            'Role',
            'Dibuat Pada'
        ];
    }

    public function map($user): array
    {
        return [
            $user->id,
            $user->username,
            $user->email,
            $user->role->name,
            $user->created_at->format('Y-m-d H:i:s'),
        ];
    }
}
