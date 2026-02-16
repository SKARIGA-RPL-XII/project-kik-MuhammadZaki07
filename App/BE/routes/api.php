<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AttributeController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BadgeController;
use App\Http\Controllers\BannerController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DiscountController;
use App\Http\Controllers\DutyScheduleController;
use App\Http\Controllers\EmployeController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\TableController;
use App\Http\Controllers\TasksController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| AUTH ROUTES
|--------------------------------------------------------------------------
*/

Route::prefix('auth')->controller(AuthController::class)->group(function () {
    Route::post('login', 'login');
    Route::post('register', 'register');
    Route::post('logout', 'logout')->middleware('auth:sanctum');
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('updateProfile', [UserController::class, 'updateProfile']);
    Route::get('user/me', [UserController::class, 'me']);
});


/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/

Route::get('categories', [CategoryController::class, 'index']);
Route::get('banners', [BannerController::class, 'index']);
Route::get('menus', [MenuController::class, 'index']);
Route::get('discounts', [DiscountController::class, 'index']);


/*
|--------------------------------------------------------------------------
| AUTHENTICATED ROUTES
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    // Tasks
    Route::resource('tasks', TasksController::class);

    // Badges
    Route::resource('badges', BadgeController::class);

    // Events
    Route::resource('events', EventController::class);

    // Duty Schedules
    Route::resource('duty-schedules', DutyScheduleController::class);

    // Roles
    Route::get('roles', [RoleController::class, 'index']);

    // Admin Resource
    Route::apiResource('admins', AdminController::class);
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
        ->only('store', 'update', 'destroy', 'show');

    Route::get('menu-admin', [MenuController::class, 'GetAllAdmin']);

    // Discount Management
    Route::resource('discounts', DiscountController::class)
        ->only('store', 'update', 'destroy');

    // Employe Management
    Route::resource('employes', EmployeController::class);

    Route::resource('attributes', AttributeController::class);

    // Settings
    Route::prefix('settings')->group(function () {
        Route::get('/', [SettingController::class, 'index']);
        Route::get('/{key}', [SettingController::class, 'show']);
        Route::put('/', [SettingController::class, 'update']);
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


Route::resource('transactions', TransactionController::class);
Route::get('tables', [TableController::class, 'index']);
Route::get('tables/{id}', [TableController::class, 'show']);
Route::get('rooms', [RoomController::class, 'index']);
Route::get('rooms/{id}', [RoomController::class, 'show']);
