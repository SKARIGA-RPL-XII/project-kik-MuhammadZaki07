<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Stock;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
            ->with(['menu' => function ($q) {
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

    public function getMetrics()
    {
        $today = now()->startOfDay();
        $thisMonth = now()->startOfMonth();

        return Controller::OKE('success', 'Metrics retrieved', [
            'income_today' => (int) Transaction::whereIn('status', ['paid', 'completed'])->where('paid_at', '>=', $today)->sum('total_amount'),
            'income_month' => (int) Transaction::whereIn('status', ['paid', 'completed'])->where('paid_at', '>=', $thisMonth)->sum('total_amount'),
            'total_transactions_today' => Transaction::where('created_at', '>=', $today)->count(),
            'low_stock_count' => Stock::where('quantity', '<', 10)->count(),
        ]);
    }

    public function getSalesChart(Request $request)
    {
        $filter = $request->query('filter', 'seven_days');
        $dateRange = $request->query('date_range');

        $query = Transaction::whereIn('status', ['paid', 'completed']);

        if ($dateRange) {
            $dates = explode(',', $dateRange);
            if (count($dates) == 2) {
                $query->whereBetween('paid_at', [$dates[0] . ' 00:00:00', $dates[1] . ' 23:59:59']);
            }
        } else {
            $startDate = match ($filter) {
                'monthly' => now()->subDays(30),
                'quarterly' => now()->subMonths(3),
                'annually' => now()->subYear(),
                default => now()->subDays(7),
            };
            $query->where('paid_at', '>=', $startDate);
        }

        $sales = $query->select(
            DB::raw('DATE(paid_at) as date'),
            DB::raw('SUM(total_amount) as total')
        )
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        return Controller::OKE('success', 'Sales chart data retrieved', $sales);
    }

    public function getBestSellers()
    {
        $bestSellers = TransactionDetail::select('menu_id', DB::raw('SUM(menu_qty) as total_sold'))
            ->with(['menu' => function ($q) {
                $q->select('id', 'name', 'menu_image');
            }])
            ->groupBy('menu_id')
            ->orderByDesc('total_sold')
            ->take(5)
            ->get();

        return Controller::OKE('success', 'Best sellers retrieved', $bestSellers);
    }

    public function getTransactionStats()
    {
        $stats = Transaction::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        return Controller::OKE('success', 'Transaction stats retrieved', $stats);
    }

    public function getLatestTransactions()
    {
        $transactions = Transaction::latest()
            ->limit(5)
            ->get()
            ->map(function ($trx) {
                return [
                    'id' => $trx->id,
                    'invoice_number' => $trx->invoice_number ?? 'TRX-' . $trx->id,
                    'total_price' => (float) ($trx->total_amount ?? $trx->total_price),
                    'status' => $trx->status,
                    'created_at' => $trx->created_at->toISOString(),
                    'user_id' => $trx->user_id,
                ];
            });

        return Controller::OKE('success', 'Latest transactions retrieved', $transactions);
    }

    public function cashierDashboard()
    {
        $today = now()->startOfDay();

        $pendingTransactions = Transaction::whereIn('status', ['pending', 'unpaid'])
            ->latest()
            ->limit(10)
            ->get();

        $stats = [
            'today_transactions' => Transaction::whereDate('created_at', $today)->count(),
            'today_income' => (int) Transaction::whereIn('status', ['paid', 'completed'])
                ->whereDate('paid_at', $today)
                ->sum('total_amount'),
            'total_pending' => Transaction::whereIn('status', ['pending', 'unpaid'])->count(),
        ];

        $todayBestSellers = TransactionDetail::select('menu_id', DB::raw('SUM(menu_qty) as total_sold'))
            ->whereHas('transaction', function ($q) use ($today) {
                $q->whereDate('created_at', $today);
            })
            ->with('menu:id,name,menu_image')
            ->groupBy('menu_id')
            ->orderByDesc('total_sold')
            ->take(3)
            ->get();

        return Controller::OKE('success', 'Cashier dashboard data retrieved', [
            'stats' => $stats,
            'pending_transactions' => $pendingTransactions,
            'today_best_sellers' => $todayBestSellers
        ]);
    }

    public function employeeDashboard()
    {
        $user = Auth::user();
        $today = now()->toDateString();

        $attendanceToday = Attendance::with('schedule.shift')
            ->where('user_id', $user->id)
            ->where('date', $today)
            ->first();

        $monthlySummary = [
            'present' => Attendance::where('user_id', $user->id)
                ->whereMonth('date', now()->month)
                ->whereIn('status', ['present', 'late'])
                ->count(),
            'alpha' => Attendance::where('user_id', $user->id)
                ->whereMonth('date', now()->month)
                ->where('status', 'alpha')
                ->count(),
        ];

        $myRecentTransactions = Transaction::where('user_id', $user->id)
            ->latest()
            ->limit(5)
            ->get();

        return Controller::OKE('success', 'Employee dashboard data retrieved', [
            'user' => [
                'name' => $user->username,
                'role' => $user->role_name
            ],
            'attendance' => $attendanceToday,
            'monthly_summary' => $monthlySummary,
            'recent_activities' => $myRecentTransactions
        ]);
    }
}
