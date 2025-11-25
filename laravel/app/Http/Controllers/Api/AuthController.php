<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Admin;
use App\Models\UserSession;
use App\Models\AdminSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * User Registration
     */
    public function registerUser(Request $request)
    {
        $request->validate([
            'username' => 'required|string|unique:users,username',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
            'full_name' => 'required|string',
            'contact_number' => 'nullable|string',
            'department' => 'nullable|string',
        ]);

        $user = User::create([
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'full_name' => $request->full_name,
            'contact_number' => $request->contact_number,
            'department' => $request->department,
            'is_active' => true,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        UserSession::create([
            'user_id' => $user->id,
            'session_token' => $token,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'login_time' => now(),
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'User registered successfully',
            'user' => $user,
            'token' => $token,
            'type' => 'user'
        ], 201);
    }

    /**
     * User Login
     */
    public function loginUser(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('username', $request->username)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'username' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (!$user->is_active) {
            throw ValidationException::withMessages([
                'username' => ['Your account has been deactivated.'],
            ]);
        }

        $user->update(['last_login' => now()]);
        $token = $user->createToken('auth_token')->plainTextToken;

        UserSession::create([
            'user_id' => $user->id,
            'session_token' => $token,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'login_time' => now(),
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token,
            'type' => 'user'
        ], 200);
    }

    /**
     * Admin Login
     */
    public function loginAdmin(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $admin = Admin::where('username', $request->username)->first();

        if (!$admin || !Hash::check($request->password, $admin->password)) {
            throw ValidationException::withMessages([
                'username' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (!$admin->is_active) {
            throw ValidationException::withMessages([
                'username' => ['Your account has been deactivated.'],
            ]);
        }

        $admin->update(['last_login' => now()]);
        $token = $admin->createToken('admin_token')->plainTextToken;

        AdminSession::create([
            'admin_id' => $admin->id,
            'session_token' => $token,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'login_time' => now(),
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'Admin login successful',
            'admin' => $admin,
            'token' => $token,
            'type' => 'admin'
        ], 200);
    }

    /**
     * User Logout
     */
    public function logoutUser(Request $request)
    {
        $user = $request->user();

        UserSession::where('user_id', $user->id)
            ->where('is_active', true)
            ->update([
                'is_active' => false,
                'logout_time' => now()
            ]);

        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ], 200);
    }

    /**
     * Admin Logout
     */
    public function logoutAdmin(Request $request)
    {
        $admin = $request->user();

        AdminSession::where('admin_id', $admin->id)
            ->where('is_active', true)
            ->update([
                'is_active' => false,
                'logout_time' => now()
            ]);

        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Admin logged out successfully'
        ], 200);
    }

    /**
     * Get authenticated user
     */
    public function getUser(Request $request)
    {
        return response()->json([
            'user' => $request->user()
        ], 200);
    }

    /**
     * Get authenticated admin
     */
    public function getAdmin(Request $request)
    {
        return response()->json([
            'admin' => $request->user()
        ], 200);
    }
}
