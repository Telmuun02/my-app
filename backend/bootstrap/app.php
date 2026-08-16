<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Passport-ийн scope middleware-ууд Laravel 11+ дээр автоматаар
        // бүртгэгддэггүй тул гараар нэр өгнө.
        //
        //   scopes:a,b  → БҮХ scope байх шаардлагатай
        //   scope:a,b   → ЯМАР НЭГ нь байхад хангалттай
        $middleware->alias([
            'scopes' => \Laravel\Passport\Http\Middleware\CheckToken::class,
            'scope'  => \Laravel\Passport\Http\Middleware\CheckTokenForAnyScope::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );
    })->create();
