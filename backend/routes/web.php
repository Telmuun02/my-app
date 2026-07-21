<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/dashboard', function () {
    return response()->json(['message' => 'Welcome to the dashboard!']);
});

Route::get('/profile', function () {
    return response()->json(['message' => 'This is your profile page.']);
});