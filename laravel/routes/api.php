<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ComplaintController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes - Authentication
Route::post('/auth/register', [AuthController::class, 'registerUser']);
Route::post('/auth/login', [AuthController::class, 'loginUser']);
Route::post('/auth/admin/login', [AuthController::class, 'loginAdmin']);

// Public routes - Categories
Route::get('/categories', [ComplaintController::class, 'getCategories']);

// Protected routes - User
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'getUser']);
    Route::post('/user/logout', [AuthController::class, 'logoutUser']);

    // Complaint routes for users
    Route::post('/complaints', [ComplaintController::class, 'store']);
    Route::get('/complaints', [ComplaintController::class, 'getUserComplaints']);
    Route::get('/complaints/{id}', [ComplaintController::class, 'show']);
});

// Protected routes - Admin
Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    Route::get('/profile', [AuthController::class, 'getAdmin']);
    Route::post('/logout', [AuthController::class, 'logoutAdmin']);

    // Complaint management for admins
    Route::get('/complaints', [ComplaintController::class, 'getAllComplaints']);
    Route::get('/complaints/{id}', [ComplaintController::class, 'show']);
    Route::put('/complaints/{id}/status', [ComplaintController::class, 'updateStatus']);
    Route::get('/statistics', [ComplaintController::class, 'getStatistics']);
});
