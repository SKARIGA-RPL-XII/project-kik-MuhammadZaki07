<?php

namespace App\Http\Controllers;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Laravel\Facades\Image;

class UserController extends Controller
{
    public function updateProfile(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            "email" => "sometimes|email|unique:users,email," . $id,
            "password" => "sometimes|nullable|string|min:6",
            "no_tlp" => "sometimes|nullable|string|unique:users,no_tlp," . $id,
            "addres" => "sometimes|nullable|string",
            "gender" => "sometimes|in:LK,PR",
            "profile_image" => "sometimes|nullable|file|mimes:png,jpg,jpeg,webp|max:2048",
            "username" => "sometimes|string",
        ]);

        if ($request->filled('password')) {
            $validated['password'] = Hash::make($request->password);
        } else {
            unset($validated['password']);
        }

        if ($request->hasFile('profile_image')) {
            if ($user->profile_image) {
                Storage::disk('public')->delete($user->profile_image);
            }

            $file = $request->file('profile_image');
            $filename = 'profile-' . uniqid() . '.webp';
            $directory = 'profile_images/';
            $fullPath = storage_path('app/public/' . $directory . $filename);

            if (!file_exists(storage_path('app/public/' . $directory))) {
                mkdir(storage_path('app/public/' . $directory), 0755, true);
            }

            Image::read($file)
                ->cover(400, 400)
                ->encodeByExtension('webp', 80)
                ->save($fullPath);

            $validated['profile_image'] = $directory . $filename;
        }

        $user->update($validated);

        $user->profile_image = $user->profile_image ? asset('storage/' . $user->profile_image) : null;

        return response()->json([
            'status' => 'success',
            'message' => 'Profile updated successfully',
            'data' => $user
        ], 200);
    }

    public function me(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                "status" => "error",
                "message" => "User not found",
            ], 404);
        }

        return response()->json([
            "status" => "success",
            "data" => [
                "id" => $user->id,
                "google_id" => $user->google_id,
                "username" => $user->username,
                "email" => $user->email,
                "no_tlp" => $user->no_tlp,
                "addres" => $user->addres,
                "gender" => $user->gender,
                "profile_image" => $user->profile_image
                    ? (str_starts_with($user->profile_image, 'http')
                        ? $user->profile_image
                        : asset('storage/' . $user->profile_image))
                    : null,
                "role_id" => $user->role_id,
                "role_name" => $user->role->name ?? 'user',
                "badge_id" => $user->badge_id,
                "badge" => $user->badge ? [
                    "id" => $user->badge->id,
                    "name" => $user->badge->name,
                    "min_spend" => $user->badge->min_spend,
                ] : null,
            ],
        ], 200);
    }

    public function destroyAccount(Request $request)
    {
        $user = auth()->user();

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Akun berhasil dihapus'
        ]);
    }

    public function getCustomers(Request $request)
    {
        $query = User::whereHas('role', function ($q) {
            $q->where('name', 'customer');
        });

        // 🔍 SEARCH
        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('username', 'like', "%$search%")
                    ->orWhere('email', 'like', "%$search%")
                    ->orWhere('no_tlp', 'like', "%$search%");
            });
        }

        // 🎯 FILTER STATUS
        if ($request->status === 'blocked') {
            $query->where('is_active', false);
        }

        if ($request->status === 'active') {
            $query->where('is_active', true);
        }

        // 📅 FILTER DATE REGISTER
        if ($request->date === 'today') {
            $query->whereDate('created_at', now());
        }

        if ($request->date === 'week') {
            $query->whereBetween('created_at', [
                now()->startOfWeek(),
                now()->endOfWeek()
            ]);
        }

        if ($request->date === 'month') {
            $query->whereMonth('created_at', now()->month);
        }

        $customers = $query->latest()->paginate($request->per_page ?? 10);

        return response()->json([
            'status' => 'success',
            'data' => $customers
        ]);
    }

    public function showCustomer($id)
    {
        $user = User::with(['role', 'badge'])->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $user
        ]);
    }

    public function updateCustomer(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            "email" => "sometimes|email|unique:users,email," . $id,
            "password" => "sometimes|nullable|string|min:6",
            "no_tlp" => "sometimes|nullable|string|unique:users,no_tlp," . $id,
            "addres" => "sometimes|nullable|string",
            "gender" => "sometimes|in:LK,PR",
            "profile_image" => "sometimes|nullable|file|mimes:png,jpg,jpeg,webp|max:2048",
            "username" => "sometimes|string",
        ]);

        if ($request->filled('password')) {
            $validated['password'] = Hash::make($request->password);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Customer updated',
            'data' => $user
        ]);
    }

    public function toggleBlock($id)
    {
        $user = User::findOrFail($id);

        $user->update([
            'is_active' => !$user->is_active
        ]);

        return response()->json([
            'status' => 'success',
            'message' => $user->is_active ? 'User diaktifkan' : 'User diblokir',
            'data' => $user
        ]);
    }

    public function deleteCustomer($id)
    {
        $user = User::findOrFail($id);

        $user->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Customer deleted'
        ]);
    }

    public function getCustomerStats()
    {
        return response()->json([
            'status' => 'success',
            'data' => [
                'total_customers' => User::count(),

                'blocked_customers' => User::where('is_active', false)->count(),

                'today_customers' => User::whereDate('created_at', now())->count(),

                'week_customers' => User::whereBetween('created_at', [
                    now()->startOfWeek(),
                    now()->endOfWeek()
                ])->count(),

                'month_customers' => User::whereMonth('created_at', now()->month)->count(),

                'top_customers' => User::withSum('transactions', 'total_amount')
                    ->orderByDesc('transactions_sum_total_amount')
                    ->limit(5)
                    ->get(),
            ]
        ]);
    }

    public function getCustomerChart()
    {
        $now = Carbon::now();

        // 📅 DAILY (hari ini per jam)
        $daily = User::select(
            DB::raw('HOUR(created_at) as hour'),
            DB::raw('COUNT(*) as total')
        )
            ->whereDate('created_at', $now->toDateString())
            ->groupBy('hour')
            ->orderBy('hour')
            ->get()
            ->map(fn($item) => [
                'label' => str_pad($item->hour, 2, '0', STR_PAD_LEFT) . ':00',
                'total' => $item->total
            ]);

        // 📅 WEEKLY (7 hari terakhir)
        $weekly = User::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as total')
        )
            ->whereBetween('created_at', [
                $now->copy()->startOfWeek(),
                $now->copy()->endOfWeek()
            ])
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn($item) => [
                'label' => Carbon::parse($item->date)->format('D'),
                'total' => $item->total
            ]);

        // 📅 MONTHLY (per hari dalam bulan ini)
        $monthly = User::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as total')
        )
            ->whereMonth('created_at', $now->month)
            ->whereYear('created_at', $now->year)
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn($item) => [
                'label' => Carbon::parse($item->date)->format('d'),
                'total' => $item->total
            ]);

        // 📅 YEARLY (per bulan)
        $yearly = User::select(
            DB::raw('MONTH(created_at) as month'),
            DB::raw('COUNT(*) as total')
        )
            ->whereYear('created_at', $now->year)
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(fn($item) => [
                'label' => Carbon::create()->month($item->month)->format('M'),
                'total' => $item->total
            ]);

        return response()->json([
            'status' => 'success',
            'data' => [
                'daily' => $daily,
                'weekly' => $weekly,
                'monthly' => $monthly,
                'yearly' => $yearly,
            ]
        ]);
    }
}
