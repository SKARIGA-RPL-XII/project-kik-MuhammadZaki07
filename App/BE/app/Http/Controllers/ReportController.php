<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function getTopSellingMenu(Request $request)
    {
        $limit = $request->get('limit', 10);

        $topMenus = TransactionDetail::select(
            'menu_id',
            DB::raw('SUM(menu_qty) as total_sold'),
            DB::raw('SUM(subtotal) as total_revenue')
        )
            ->whereHas('transaction', function ($query) {
                $query->whereIn('status', ['paid', 'completed']);
            })
            ->with(['menu' => function ($query) {
                $query->select('id', 'name', 'category_id', 'price', 'menu_image')
                    ->with('category:id,name');
            }])
            ->groupBy('menu_id')
            ->orderBy('total_sold', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($item) {
                if ($item->menu) {
                    $item->menu->calculated_stock = $item->menu->calculated_stock;
                }
                return $item;
            });

        return response()->json([
            'status' => 'success',
            'message' => 'Success get top selling menu',
            'data' => $topMenus
        ]);
    }

    public function getSalesSummary(Request $request)
    {
        $days = $request->get('days', 7);
        $data = [];

        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $data[$date] = [
                'date' => $date,
                'revenue' => 0,
                'transaction_count' => 0
            ];
        }

        $salesData = Transaction::select(
            DB::raw('DATE(transaction_date) as date'),
            DB::raw('SUM(total_amount) as revenue'),
            DB::raw('COUNT(id) as transaction_count')
        )
            ->where('transaction_date', '>=', now()->subDays($days - 1)->startOfDay())
            ->whereIn('status', ['paid', 'completed'])
            ->groupBy('date')
            ->get();

        foreach ($salesData as $row) {
            $data[$row->date] = [
                'date' => $row->date,
                'revenue' => (int) $row->revenue,
                'transaction_count' => $row->transaction_count
            ];
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'total_revenue' => (int) Transaction::whereIn('status', ['paid', 'completed'])->whereDate('transaction_date', now())->sum('total_amount'),
                'total_transactions' => Transaction::whereIn('status', ['paid', 'completed'])->whereDate('transaction_date', now())->count(),
                'chart_data' => array_values($data)
            ]
        ]);
    }

    public function getTransactionExplorer(Request $request)
    {
        $perPage = $request->get('per_page', 10);

        $query = Transaction::with([
            'user:id,username',
            'cashier:id,username',
            'details.menu'
        ])
            ->whereIn('status', ['paid', 'completed']);

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('transaction_date', [$request->start_date . ' 00:00:00', $request->end_date . ' 23:59:59']);
        }
        if ($request->filled('cashier_id')) {
            $query->where('user_id', $request->cashier_id);
        }
        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }
        if ($request->filled('min_amount')) {
            $query->where('total_amount', '>=', $request->min_amount);
        }
        if ($request->filled('max_amount')) {
            $query->where('total_amount', '<=', $request->max_amount);
        }

        $summaryQuery = clone $query;
        $totalCount = $summaryQuery->count();
        $totalAmount = (int) $summaryQuery->sum('total_amount');

        $transactions = $query->orderBy('transaction_date', 'desc')->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'message' => 'Success fetch transactions',
            'data' => $transactions->items(),
            'meta' => [
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
                'per_page' => $transactions->perPage(),
                'total' => $transactions->total(),
            ],
            'summary' => [
                'total_count' => $totalCount,
                'total_amount' => $totalAmount
            ]
        ]);
    }
}
