<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ComplaintController;
use App\Http\Controllers\Api\ComplaintMessageController;
use App\Http\Controllers\Api\PasswordResetController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes - Authentication
Route::post('/auth/register', [AuthController::class, 'registerUser']);
Route::post('/auth/login', [AuthController::class, 'loginUser']);
Route::post('/auth/admin/login', [AuthController::class, 'loginAdmin']);

// Public routes - Password Reset
Route::post('/password/forgot', [PasswordResetController::class, 'sendResetLink']);
Route::post('/password/forgot/user', [PasswordResetController::class, 'sendResetLinkUser']);
Route::post('/password/forgot/admin', [PasswordResetController::class, 'sendResetLinkAdmin']);
Route::post('/password/reset', [PasswordResetController::class, 'resetPassword']);

// Public routes - Categories
Route::get('/categories', [ComplaintController::class, 'getCategories']);

// Public routes - Get available admins for complaint assignment
Route::get('/admins/available', [AuthController::class, 'getAvailableAdmins']);

// Protected routes - User
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'getUser']);
    Route::post('/user/logout', [AuthController::class, 'logoutUser']);

    // Complaint routes for users
    Route::post('/complaints', [ComplaintController::class, 'store']);
    Route::get('/complaints', [ComplaintController::class, 'getUserComplaints']);
    Route::get('/complaints/{id}', [ComplaintController::class, 'show']);

    // Message routes (for both users and admins)
    Route::get('/complaints/{id}/messages', [ComplaintMessageController::class, 'index']);
    Route::post('/complaints/{id}/messages', [ComplaintMessageController::class, 'store']);
    Route::put('/messages/{id}/read', [ComplaintMessageController::class, 'markAsRead']);
    Route::get('/complaints/{id}/messages/unread-count', [ComplaintMessageController::class, 'unreadCount']);
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
