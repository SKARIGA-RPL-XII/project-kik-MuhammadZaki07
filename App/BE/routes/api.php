<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\AttributeController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BadgeController;
use App\Http\Controllers\BannerController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DiscountController;
use App\Http\Controllers\DutyScheduleController;
use App\Http\Controllers\EmployeController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\MidtransWebhookController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\StockAdjustmentController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\TableController;
use App\Http\Controllers\TasksController;
use App\Http\Controllers\TransactionController;
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

    Route::resource('transactions', TransactionController::class);
    Route::patch('/transactions/{id}/status', [TransactionController::class, 'updateStatus']);
    Route::post('/cashier/checkout', [TransactionController::class, 'store']);
    Route::get('/transactions/search/{code}', [TransactionController::class, 'searchByCode']);
    Route::get('/dashboard/summary', [DashboardController::class, 'index']);
    Route::get('/user/transactions', [TransactionController::class, 'userTransactions']);
});


/*
|--------------------------------------------------------------------------
| ADMIN ONLY ROUTES
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'admin'])->group(function () {

    // Category Management
    Route::resource('category', CategoryController::class)
        ->only('store', 'update', 'destroy');

    // Banner Management
    Route::resource('banners', BannerController::class)
        ->only('store', 'update', 'destroy');
    Route::get("banners-admin",  [BannerController::class, 'getBannerAdmin']);

    // Menu Management
    Route::resource('menus', MenuController::class)
        ->only('store', 'update', 'destroy');



    Route::apiResource('stocks', StockController::class);
    Route::apiResource('suppliers', SupplierController::class);

    Route::get('/stock-adjustments', [StockAdjustmentController::class, 'index']);
    Route::post('/stock-adjustments', [StockAdjustmentController::class, 'store']);
    Route::get('/stock-adjustments/{id}', [StockAdjustmentController::class, 'show']);
    Route::delete('/stock-adjustments/{id}', [StockAdjustmentController::class, 'destroy']);


    Route::apiResource('admins', AdminController::class);

    Route::get('menu-admin', [MenuController::class, 'GetAllAdmin']);

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
});


/*
|--------------------------------------------------------------------------
| GENERAL RESOURCES (NO MIDDLEWARE CHANGED)
|--------------------------------------------------------------------------
*/

Route::post('/transactions/{id}/confirm-payment', [TransactionController::class, 'confirmPayment']);
Route::get('tables', [TableController::class, 'index']);
Route::get('tables/{table}', [TableController::class, 'show']);
Route::get('rooms', [RoomController::class, 'index']);
Route::get('rooms/{id}', [RoomController::class, 'show']);
Route::get('/settings', [SettingController::class, 'index']);

Broadcast::routes(['middleware' => ['auth:sanctum']]);
Route::post('/midtrans/callback', [MidtransWebhookController::class, 'callback']);
