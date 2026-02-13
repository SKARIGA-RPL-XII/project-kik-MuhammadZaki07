<?php

use App\Http\Controllers\Controller;
use App\Http\Middleware\AdminMiddleware;
use App\Http\Middleware\CustomerMidlleware;
use App\Http\Middleware\EmployeMiddleware;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Validation\ValidationException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            "admin" => AdminMiddleware::class,
            "employe" => EmployeMiddleware::class,
            "customer" => CustomerMidlleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (AuthenticationException $auth) {
            return response()->json([
                "status" => "invalid_token",
                "message" => "Invalid or expired token"
            ], 401);
        });

        $exceptions->render(function (ValidationException $ex) {
            return response()->json([
                "message" => "error validations",
                "errors" => $ex->errors()
            ],400);
        });
    })->create();
