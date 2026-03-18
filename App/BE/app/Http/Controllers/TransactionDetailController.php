<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\TransactionDetail;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Exception;
use Illuminate\Support\Facades\DB;

class TransactionDetailController extends Controller
{
    public function index(Request $request)
    {
        $query = TransactionDetail::with([
            'menu:id,name,menu_image',
            'transaction.table:id,table_number',
            'transaction.cashier:id,username'
        ]);

        if ($request->has('transaction_id')) {
            $query->where('transaction_id', $request->transaction_id);
        }

        $query->when($request->search, function ($q) use ($request) {
            return $q->whereHas('menu', function ($sub) use ($request) {
                $sub->where('name', 'like', '%' . $request->search . '%');
            });
        });

        $query->when($request->filter_time, function ($q) use ($request) {
            $now = Carbon::now();
            switch ($request->filter_time) {
                case 'today':
                    return $q->whereDate('created_at', $now->today());
                case 'this_week':
                    return $q->whereBetween('created_at', [
                        $now->copy()->startOfWeek()->toDateTimeString(),
                        $now->copy()->endOfWeek()->toDateTimeString()
                    ]);
                case 'this_month':
                    return $q->whereMonth('created_at', $now->month)
                        ->whereYear('created_at', $now->year);
            }
        });

        $sortBy = $request->get('sort_by', 'created_at');
        $sortDir = $request->get('sort_direction', 'desc');

        $allowedSort = ['price', 'created_at', 'qty'];
        $actualSort = in_array($sortBy, $allowedSort) ? $sortBy : 'created_at';

        $query->orderBy($actualSort, $sortDir);

        try {
            $perPage = $request->get('size', 15);
            $details = $query->paginate($perPage);

            $cleanData = collect($details->items())->map(function ($item) {
                return [
                    'id' => $item->id,
                    'transaction_id' => $item->transaction_id,
                    'transaction' => $item->transaction,
                    'qty' => $item->menu_qty,
                    'subtotal' => $item->subtotal,
                    'status' => $item->status,
                    'menu_name' => $item->menu->name ?? 'N/A',
                    'menu_image' => $item->menu->menu_image ?? null,
                    'transaction_code' => $item->transaction->transaction_code ?? '-',
                    'customer' => $item->transaction->customer_name ?? 'Guest',
                    'table' => $item->transaction->table->table_number ?? 'T.Away',
                    'cashier' => $item->transaction->cashier->name ?? 'System',
                    'time' => $item->created_at->format('H:i d/m/y'),
                ];
            });

            return response()->json([
                'status' => 'success',
                'data' => $cleanData,
                'meta' => [
                    'current_page' => $details->currentPage(),
                    'last_page' => $details->lastPage(),
                    'total' => $details->total()
                ]
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch history: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $detail = TransactionDetail::with([
                'menu.attributes',
                'transaction.table',
                'transaction.user',
                'transaction.cashier',
                'transaction.booking'
            ])->findOrFail($id);

            return response()->json([
                'status' => 'success',
                'data' => $detail
            ]);
        } catch (Exception $e) {
            return response()->json(['status' => 'error', 'message' => 'Not found'], 404);
        }
    }

    public function statistics()
    {
        try {
            $now = Carbon::now();

            $revenueToday = Transaction::whereDate('created_at', $now->today())
                ->whereIn('status', ['paid', 'to_cook', 'cooking', 'completed'])
                ->sum('total_amount');

            $totalRevenueAllTime = Transaction::whereIn('status', ['paid', 'to_cook', 'cooking', 'completed'])
                ->sum('total_amount');

            $topCustomer = Transaction::select(
                'transactions.customer_name',
                DB::raw('count(*) as total_orders'),
                'users.email',
                'users.profile_image'
            )
                ->leftJoin('users', 'transactions.customer_name', '=', 'users.username')
                ->where('transactions.customer_name', '!=', 'Guest')
                ->groupBy('transactions.customer_name', 'users.email', 'users.profile_image')
                ->orderBy('total_orders', 'desc')
                ->first();

            $peakMonth = Transaction::select(
                DB::raw('MONTHNAME(created_at) as month'),
                DB::raw('count(*) as count')
            )
                ->groupBy('month')
                ->orderBy('count', 'desc')
                ->first();

            $totalItemsSold = TransactionDetail::sum('menu_qty');

            return response()->json([
                'status' => 'success',
                'data' => [
                    'revenue_today' => (int)$revenueToday,
                    'total_revenue' => (int)$totalRevenueAllTime,
                    'top_customer' => [
                        'name' => $topCustomer->customer_name ?? 'N/A',
                        'email' => $topCustomer->email ?? 'N/A',
                        'image' => $topCustomer->profile_image ?? null,
                        'total_orders' => $topCustomer->total_orders ?? 0
                    ],
                    'peak_month' => $peakMonth->month ?? 'N/A',
                    'items_sold' => (int)$totalItemsSold,
                ]
            ]);
        } catch (Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }
}
