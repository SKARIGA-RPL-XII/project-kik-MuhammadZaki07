<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class AttendanceExport implements FromCollection, WithHeadings, WithMapping
{
    protected $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function collection()
    {
        return $this->data;
    }

    public function headings(): array
    {
        return [
            'Nama Karyawan',
            'Role',
            'Tanggal',
            'Jam Masuk',
            'Jam Pulang',
            'Status',
            'Denda (Rp)',
            'Latitude In',
            'Longitude In',
            'Latitude Out',
            'Longitude Out',
            'Dibuat Pada'
        ];
    }

    public function map($attendance): array
    {
        return [
            $attendance->user->username ?? 'N/A',
            $attendance->user->role_name || $attendance->user->role->name ?? 'N/A',
            $attendance->date,
            $attendance->clock_in ?? '-',
            $attendance->clock_out ?? '-',
            strtoupper($attendance->status),
            number_format($attendance->total_penalty, 0, ',', '.'),
            $attendance->lat_in ?? '-',
            $attendance->long_in ?? '-',
            $attendance->lat_out ?? '-',
            $attendance->long_out ?? '-',
            $attendance->created_at->format('Y-m-d H:i:s'),
        ];
    }
}
