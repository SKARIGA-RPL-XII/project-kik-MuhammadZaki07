<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AiAssistantController;
use App\Http\Controllers\AIController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\AttributeController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BadgeController;
use App\Http\Controllers\BannerController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DiscountController;
use App\Http\Controllers\DutyScheduleController;
use App\Http\Controllers\EmployeController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\LeaveController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\MidtransWebhookController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\ShiftController;
use App\Http\Controllers\StockAdjustmentController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\TableController;
use App\Http\Controllers\TasksController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\TransactionDetailController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| AUTH ROUTES
|--------------------------------------------------------------------------
*/

Route::prefix('auth')->controller(AuthController::class)->group(function () {
    Route::post('login', 'login');
    Route::post('register', 'register');
    Route::post('/google', [AuthController::class, 'googleLogin']);
    Route::post('logout', 'logout')->middleware('auth:sanctum');
});


/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/

Route::get('categories', [CategoryController::class, 'index']);
Route::get('banners', [BannerController::class, 'index']);
Route::get('menus', [MenuController::class, 'index']);
Route::get('menus/{id}', [MenuController::class, 'show']);
Route::get('discounts', [DiscountController::class, 'index']);


/*
|--------------------------------------------------------------------------
| AUTHENTICATED ROUTES
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::match(['post', 'put'], 'users/{id}', [UserController::class, 'updateProfile']);
    Route::get('user/me', [UserController::class, 'me']);
    Route::resource('tasks', TasksController::class);
    Route::resource('badges', BadgeController::class);
    Route::resource('events', EventController::class);
    Route::resource('duty-schedules', DutyScheduleController::class);
    Route::get('roles', [RoleController::class, 'index']);
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::post('/subscribe', [NotificationController::class, 'subscribe']);
        Route::put('/read-all', [NotificationController::class, 'markAllAsRead']);
        Route::get('/{id}', [NotificationController::class, 'show']);
        Route::put('/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::delete('/{id}', [NotificationController::class, 'destroy']);
    });
    Route::prefix('employes')->group(function () {
        Route::get('/export', [EmployeController::class, 'export']);
        Route::post('/import', [EmployeController::class, 'import']);
    });
    Route::post('/admins/export', [AdminController::class, 'export']);
    Route::post('/admins/import-mapping', [AdminController::class, 'importMapping']);
    Route::delete('/user/delete', [UserController::class, 'destroyAccount']);
    Route::get('/transactions/statistics', [TransactionDetailController::class, 'statistics']);
    Route::get('/transactions/export', [TransactionController::class, 'exportAll']);
    Route::get('/transactions/export/{id}', [TransactionController::class, 'exportSingle']);

    Route::resource('transactions', TransactionController::class);
    Route::patch('/transactions/{id}/status', [TransactionController::class, 'updateStatus']);
    Route::patch('/transactions', [TransactionController::class, 'index']);
    Route::post('/cashier/checkout', [TransactionController::class, 'store']);
    Route::get('/transactions/search/{code}', [TransactionController::class, 'searchByCode']);
    Route::get('/dashboard/summary', [DashboardController::class, 'index']);
    Route::get('/user/transactions', [TransactionController::class, 'userTransactions']);
    Route::post('/transactions/{id}/confirm-payment', [TransactionController::class, 'confirmPayment']);
    Route::get('/transactions/{id}/snap-token', [TransactionController::class, 'getSnapToken']);


    Route::get('/transaction-details', [TransactionDetailController::class, 'index']);
    Route::get('/transaction-details/show/{id}', [TransactionDetailController::class, 'show']);

    Route::get('/logs', [ActivityLogController::class, 'index']);
    Route::get('/logs/{id}', [ActivityLogController::class, 'show']);
    Route::delete('/logs/{id}', [ActivityLogController::class, 'destroy']);
    Route::post('/logs/{id}/restore', [ActivityLogController::class, 'restore']);


    Route::prefix('bookings')->group(function () {
        Route::get('/', [BookingController::class, 'index']);
        Route::post('/', [BookingController::class, 'store']);
        Route::put('/{id}/approve', [BookingController::class, 'approve']);
        Route::put('/{id}/reject', [BookingController::class, 'reject']);
        Route::delete('/{id}', [BookingController::class, 'destroy']);
    });

    Route::prefix('dashboard')->group(function () {
        Route::get('/metrics', [DashboardController::class, 'getMetrics']);
        Route::get('/sales-chart', [DashboardController::class, 'getSalesChart']);
        Route::get('/best-sellers', [DashboardController::class, 'getBestSellers']);
        Route::get('/transaction-stats', [DashboardController::class, 'getTransactionStats']);
        Route::get('/latest-transactions', [DashboardController::class, 'getLatestTransactions']);
        Route::get('/cashier', [DashboardController::class, 'cashierDashboard']);
        Route::get('/employee', [DashboardController::class, 'employeeDashboard']);
    });

    Route::patch('tasks/{task}/toggle', [TasksController::class, 'toggleStatus']);
    Route::get('/reports/top-selling', [ReportController::class, 'getTopSellingMenu']);
    Route::get('/reports/sales-summary', [ReportController::class, 'getSalesSummary']);
    Route::get('/reports/explorer', [ReportController::class, 'getTransactionExplorer']);

    Route::apiResource('shifts', ShiftController::class);
    Route::apiResource('schedules', ScheduleController::class);
    Route::post('schedules/bulk', [ScheduleController::class, 'bulkStore']);

    Route::middleware('auth:sanctum')->prefix('attendance')->group(function () {
        Route::get('/my', [AttendanceController::class, 'myAttendance']);
        Route::get('/export/{format}', [AttendanceController::class, 'exportExcel']);
        Route::get('/status-today', [AttendanceController::class, 'statusToday']);
        Route::post('/clock-in', [AttendanceController::class, 'clockIn']);
        Route::post('/clock-out', [AttendanceController::class, 'clockOut']);
        Route::get('/admin/all', [AttendanceController::class, 'adminIndex']);
        Route::get('/{id}', [AttendanceController::class, 'show']);
        Route::get('/', [AttendanceController::class, 'index']);
    });

    Route::get('/leaves/my', [LeaveController::class, 'myLeaves']);
    Route::get('/leaves', [LeaveController::class, 'index']);
    Route::post('/leaves', [LeaveController::class, 'store']);
    Route::post('/leaves/{id}/approve', [LeaveController::class, 'approve']);
    Route::get('/leaves/{id}', [LeaveController::class, 'show']);

    Route::get('menu-admin', [MenuController::class, 'GetAllAdmin']);
});


/*
|--------------------------------------------------------------------------
| ADMIN ONLY ROUTES
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'admin'])->group(function () {

    Route::resource('category', CategoryController::class)
        ->only('store', 'update', 'destroy');

    Route::resource('banners', BannerController::class)
        ->only('store', 'update', 'destroy');
    Route::get("banners-admin",  [BannerController::class, 'getBannerAdmin']);

    Route::resource('menus', MenuController::class)
        ->only('store', 'update', 'destroy');


    Route::apiResource('stocks', StockController::class);
    Route::apiResource('suppliers', SupplierController::class);

    Route::get('/stock-adjustments', [StockAdjustmentController::class, 'index']);
    Route::post('/stock-adjustments', [StockAdjustmentController::class, 'store']);
    Route::get('/stock-adjustments/{id}', [StockAdjustmentController::class, 'show']);
    Route::delete('/stock-adjustments/{id}', [StockAdjustmentController::class, 'destroy']);


    Route::apiResource('admins', AdminController::class);


    // Discount Management
    Route::resource('discounts', DiscountController::class)
        ->only('store', 'update', 'destroy');

    // Employe Management
    Route::resource('employes', EmployeController::class);

    Route::resource('attributes', AttributeController::class);

    Route::prefix('settings')->group(function () {
        Route::match(['post', 'put'], '/bulk', [SettingController::class, 'updateBulk']);
        Route::get('/{key}', [SettingController::class, 'show']);
        Route::delete('/{key}', [SettingController::class, 'destroy']);
    });

    // Room Management
    Route::put('rooms/{room}/update-layout', [RoomController::class, 'updateLayout']);
    Route::get('rooms/available-tables', [RoomController::class, 'availableTables']);


    Route::resource('tables', TableController::class)->only("store", 'update', 'destroy');
    Route::resource('rooms', RoomController::class)->only("store", 'update', 'destroy', 'updateLayout', 'availableTables');

    Route::prefix('customers')->group(function () {
        Route::get('/chart', [UserController::class, 'getCustomerChart']);
        Route::get('/stats', [UserController::class, 'getCustomerStats']);
        Route::get('/', [UserController::class, 'getCustomers']);
        Route::get('/{id}', [UserController::class, 'showCustomer']);
        Route::patch('/{id}/toggle-block', [UserController::class, 'toggleBlock']);
        Route::delete('/{id}', [UserController::class, 'deleteCustomer']);
        Route::put('/{id}', [UserController::class, 'updateCustomer']);
    });
});


/*
|--------------------------------------------------------------------------
| GENERAL RESOURCES (NO MIDDLEWARE CHANGED)
|--------------------------------------------------------------------------
*/


Route::get('tables', [TableController::class, 'index']);
Route::get('tables/{table}', [TableController::class, 'show']);
Route::get('rooms', [RoomController::class, 'index']);
Route::get('rooms/{id}', [RoomController::class, 'show']);
Route::get('/settings', [SettingController::class, 'index']);

Broadcast::routes(['middleware' => ['auth:sanctum']]);
Route::post('/midtrans/callback', [MidtransWebhookController::class, 'callback']);

// Route::post('/ai/chat', [AiAssistantController::class, 'chat']);
Route::post('/ai/chat', [AIController::class, 'chat'])->middleware(['auth:sanctum', 'throttle:20,1']);
Route::post('/ai/guest-chat', [AIController::class, 'guestChat'])->middleware('throttle:15,1');
