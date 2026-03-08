<?php

namespace App\Http\Controllers;

use App\Models\Stock;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $today = now()->startOfDay();
        $thisMonth = now()->startOfMonth();

        $incomeToday = Transaction::whereIn('status', ['paid', 'completed'])
            ->where('paid_at', '>=', $today)
            ->sum('total_amount');

        $incomeMonth = Transaction::whereIn('status', ['paid', 'completed'])
            ->where('paid_at', '>=', $thisMonth)
            ->sum('total_amount');

        $lowStockItems = Stock::where('quantity', '<', 10)
            ->select('name', 'quantity', 'unit')
            ->orderBy('quantity', 'asc')
            ->get();

        $bestSellers = TransactionDetail::select('menu_id', DB::raw('SUM(menu_qty) as total_sold'))
            ->with(['menu' => function($q) {
                $q->select('id', 'name', 'menu_image');
            }])
            ->groupBy('menu_id')
            ->orderByDesc('total_sold')
            ->take(5)
            ->get();

        $transactionStats = Transaction::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        $salesChart = Transaction::whereIn('status', ['paid', 'completed'])
            ->where('paid_at', '>=', now()->subDays(7))
            ->select(
                DB::raw('DATE(paid_at) as date'),
                DB::raw('SUM(total_amount) as total')
            )
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        return Controller::OKE('success', 'Dashboard data retrieved successfully', [
            'stats' => [
                'income_today' => (int) $incomeToday,
                'income_month' => (int) $incomeMonth,
                'low_stock_count' => $lowStockItems->count(),
                'total_transactions_today' => Transaction::where('created_at', '>=', $today)->count(),
            ],
            'low_stock_items' => $lowStockItems,
            'best_sellers' => $bestSellers,
            'transaction_stats' => $transactionStats,
            'sales_chart' => $salesChart
        ], 200);
    }
}
