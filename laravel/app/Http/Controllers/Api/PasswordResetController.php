<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\PasswordResetMail;
use App\Models\User;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PasswordResetController extends Controller
{
    /**
     * Send password reset link - Auto-detect user or admin
     */
    public function sendResetLink(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        // Check if email belongs to a user
        $user = User::where('email', $request->email)->first();

        if ($user) {
            return $this->sendResetLinkForType($request->email, $user->full_name, 'user');
        }

        // Check if email belongs to an admin
        $admin = Admin::where('email', $request->email)->first();

        if ($admin) {
            return $this->sendResetLinkForType($request->email, $admin->full_name, 'admin');
        }

        // Email not found in either table
        throw ValidationException::withMessages([
            'email' => ['We could not find an account with that email address.'],
        ]);
    }

    /**
     * Helper method to send reset link for a specific type
     */
    private function sendResetLinkForType(string $email, string $name, string $type)
    {
        // Generate reset token
        $token = Str::random(64);

        // Delete any existing tokens for this email
        DB::table('password_reset_tokens')
            ->where('email', $email)
            ->where('type', $type)
            ->delete();

        // Create new token
        DB::table('password_reset_tokens')->insert([
            'email' => $email,
            'token' => Hash::make($token),
            'type' => $type,
            'created_at' => now(),
        ]);

        // Generate reset URL
        $resetUrl = config('app.frontend_url', 'http://localhost:4200')
            . '/reset-password?token=' . $token
            . '&email=' . urlencode($email)
            . '&type=' . $type;

        // Send email
        Mail::to($email)->send(
            new PasswordResetMail($resetUrl, $name, $type)
        );

        return response()->json([
            'message' => 'Password reset link has been sent to your email address.'
        ], 200);
    }

    /**
     * Send password reset link to user
     */
    public function sendResetLinkUser(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['We could not find a user with that email address.'],
            ]);
        }

        // Generate reset token
        $token = Str::random(64);

        // Delete any existing tokens for this email
        DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->where('type', 'user')
            ->delete();

        // Create new token
        DB::table('password_reset_tokens')->insert([
            'email' => $request->email,
            'token' => Hash::make($token),
            'type' => 'user',
            'created_at' => now(),
        ]);

        // Generate reset URL
        $resetUrl = config('app.frontend_url', 'http://localhost:4200')
            . '/reset-password?token=' . $token
            . '&email=' . urlencode($request->email)
            . '&type=user';

        // Send email
        Mail::to($user->email)->send(
            new PasswordResetMail($resetUrl, $user->full_name, 'user')
        );

        return response()->json([
            'message' => 'Password reset link has been sent to your email address.'
        ], 200);
    }

    /**
     * Send password reset link to admin
     */
    public function sendResetLinkAdmin(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $admin = Admin::where('email', $request->email)->first();

        if (!$admin) {
            throw ValidationException::withMessages([
                'email' => ['We could not find an admin with that email address.'],
            ]);
        }

        // Generate reset token
        $token = Str::random(64);

        // Delete any existing tokens for this email
        DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->where('type', 'admin')
            ->delete();

        // Create new token
        DB::table('password_reset_tokens')->insert([
            'email' => $request->email,
            'token' => Hash::make($token),
            'type' => 'admin',
            'created_at' => now(),
        ]);

        // Generate reset URL
        $resetUrl = config('app.frontend_url', 'http://localhost:4200')
            . '/reset-password?token=' . $token
            . '&email=' . urlencode($request->email)
            . '&type=admin';

        // Send email
        Mail::to($admin->email)->send(
            new PasswordResetMail($resetUrl, $admin->full_name, 'admin')
        );

        return response()->json([
            'message' => 'Password reset link has been sent to your email address.'
        ], 200);
    }

    /**
     * Reset password for user or admin
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|string|min:6|confirmed',
            'type' => 'required|in:user,admin',
        ]);

        // Find the token record
        $resetRecord = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->where('type', $request->type)
            ->first();

        if (!$resetRecord) {
            throw ValidationException::withMessages([
                'email' => ['Invalid or expired reset token.'],
            ]);
        }

        // Check if token matches
        if (!Hash::check($request->token, $resetRecord->token)) {
            throw ValidationException::withMessages([
                'token' => ['Invalid reset token.'],
            ]);
        }

        // Check if token is expired (1 hour)
        $createdAt = \Carbon\Carbon::parse($resetRecord->created_at);
        if ($createdAt->addHour()->isPast()) {
            // Delete expired token
            DB::table('password_reset_tokens')
                ->where('email', $request->email)
                ->where('type', $request->type)
                ->delete();

            throw ValidationException::withMessages([
                'token' => ['Reset token has expired. Please request a new one.'],
            ]);
        }

        // Reset password based on type
        if ($request->type === 'user') {
            $user = User::where('email', $request->email)->first();

            if (!$user) {
                throw ValidationException::withMessages([
                    'email' => ['User not found.'],
                ]);
            }

            $user->password = Hash::make($request->password);
            $user->save();
        } else {
            $admin = Admin::where('email', $request->email)->first();

            if (!$admin) {
                throw ValidationException::withMessages([
                    'email' => ['Admin not found.'],
                ]);
            }

            $admin->password = Hash::make($request->password);
            $admin->save();
        }

        // Delete the used token
        DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->where('type', $request->type)
            ->delete();

        return response()->json([
            'message' => 'Password has been reset successfully. You can now login with your new password.'
        ], 200);
    }
}
