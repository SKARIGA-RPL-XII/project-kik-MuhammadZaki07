<?php

namespace App\Exports;

use App\Models\Transaction;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class TransactionsExport implements FromQuery, WithHeadings, WithMapping
{
    protected $id;

    public function __construct($id = null)
    {
        $this->id = $id;
    }

    public function query()
    {
        $query = Transaction::query()->with(['details.menu', 'table']);

        if (!empty($this->id)) {
            $query->where('id', $this->id);
        }

        return $query;
    }

    public function headings(): array
    {
        return ["ID", "Code Transaction", "Customer", "Table number", "Total", "Status", "Date/Time"];
    }

    public function map($transaction): array
    {
        return [
            $transaction->id,
            $transaction->transaction_code ?? '-',
            $transaction->customer_name ?? 'Pelanggan Umum',
            $transaction->table->table_number ?? 'Take Away',
            number_format($transaction->total_amount, 0, ',', '.'),
            strtoupper(str_replace('_', ' ', $transaction->status)),
            $transaction->created_at ? $transaction->created_at->format('d/m/Y H:i') : '-'
        ];
    }
}
