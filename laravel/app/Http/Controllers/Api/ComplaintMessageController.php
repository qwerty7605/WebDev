<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\ComplaintMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class ComplaintMessageController extends Controller
{
    /**
     * Get all messages for a complaint
     */
    public function index(Request $request, $complaintId)
    {
        $complaint = Complaint::findOrFail($complaintId);
        $user = $request->user();

        // Authorization: User can only view messages for their own complaints
        // Admins can only view messages for complaints assigned to them
        if ($user instanceof \App\Models\User) {
            if ($complaint->user_id !== $user->id) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }
        } elseif ($user instanceof \App\Models\Admin) {
            // Admins can view any complaint assigned to them
            if ($complaint->assigned_to !== $user->id) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }
        } else {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Get messages with sender information
        $messages = ComplaintMessage::where('complaint_id', $complaintId)
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($message) {
                $sender = null;
                if ($message->sender_type === 'user') {
                    $senderData = $message->userSender;
                    if ($senderData) {
                        $sender = [
                            'id' => $senderData->id,
                            'full_name' => $senderData->full_name,
                            'email' => $senderData->email,
                        ];
                    }
                } else {
                    $senderData = $message->adminSender;
                    if ($senderData) {
                        $sender = [
                            'id' => $senderData->id,
                            'full_name' => $senderData->full_name,
                            'role' => $senderData->role,
                        ];
                    }
                }

                return [
                    'id' => $message->id,
                    'complaint_id' => $message->complaint_id,
                    'sender_id' => $message->sender_id,
                    'sender_type' => $message->sender_type,
                    'sender' => $sender,
                    'message' => $message->message,
                    'attachment_path' => $message->attachment_path,
                    'is_read' => $message->is_read,
                    'created_at' => $message->created_at->toISOString(),
                    'updated_at' => $message->updated_at->toISOString(),
                ];
            });

        return response()->json($messages, 200);
    }

    /**
     * Send a new message
     */
    public function store(Request $request, $complaintId)
    {
        $complaint = Complaint::findOrFail($complaintId);
        $user = $request->user();

        // Validate message
        $request->validate([
            'message' => 'required|string|max:5000',
        ]);

        // Determine sender type and authorization
        $senderType = null;
        $senderId = null;

        if ($user instanceof \App\Models\User) {
            if ($complaint->user_id !== $user->id) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }
            $senderType = 'user';
            $senderId = $user->id;
        } elseif ($user instanceof \App\Models\Admin) {
            if ($complaint->assigned_to !== $user->id) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }
            $senderType = 'admin';
            $senderId = $user->id;
        } else {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Create message
        $message = ComplaintMessage::create([
            'complaint_id' => $complaintId,
            'sender_id' => $senderId,
            'sender_type' => $senderType,
            'message' => $request->message,
            'is_read' => false,
        ]);

        // Load sender information
        $sender = null;
        if ($senderType === 'user') {
            $senderData = $message->userSender;
            if ($senderData) {
                $sender = [
                    'id' => $senderData->id,
                    'full_name' => $senderData->full_name,
                    'email' => $senderData->email,
                ];
            }
        } else {
            $senderData = $message->adminSender;
            if ($senderData) {
                $sender = [
                    'id' => $senderData->id,
                    'full_name' => $senderData->full_name,
                    'role' => $senderData->role,
                ];
            }
        }

        return response()->json([
            'id' => $message->id,
            'complaint_id' => $message->complaint_id,
            'sender_id' => $message->sender_id,
            'sender_type' => $message->sender_type,
            'sender' => $sender,
            'message' => $message->message,
            'attachment_path' => $message->attachment_path,
            'is_read' => $message->is_read,
            'created_at' => $message->created_at->toISOString(),
            'updated_at' => $message->updated_at->toISOString(),
        ], 201);
    }

    /**
     * Mark messages as read
     */
    public function markAsRead(Request $request, $messageId)
    {
        $message = ComplaintMessage::findOrFail($messageId);
        $user = $request->user();

        // Get the complaint to check authorization
        $complaint = $message->complaint;

        // Users can mark admin messages as read
        // Admins can mark user messages as read
        if ($user instanceof \App\Models\User) {
            if ($complaint->user_id !== $user->id) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }
            // User can only mark admin messages as read
            if ($message->sender_type !== 'admin') {
                return response()->json(['error' => 'Cannot mark own message as read'], 400);
            }
        } elseif ($user instanceof \App\Models\Admin) {
            if ($complaint->assigned_to !== $user->id) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }
            // Admin can only mark user messages as read
            if ($message->sender_type !== 'user') {
                return response()->json(['error' => 'Cannot mark own message as read'], 400);
            }
        } else {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $message->is_read = true;
        $message->save();

        return response()->json(['message' => 'Message marked as read'], 200);
    }

    /**
     * Get unread message count for a complaint
     */
    public function unreadCount(Request $request, $complaintId)
    {
        $complaint = Complaint::findOrFail($complaintId);
        $user = $request->user();

        // Authorization check
        if ($user instanceof \App\Models\User) {
            if ($complaint->user_id !== $user->id) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }
            // Count unread messages from admin
            $count = ComplaintMessage::where('complaint_id', $complaintId)
                ->where('sender_type', 'admin')
                ->where('is_read', false)
                ->count();
        } elseif ($user instanceof \App\Models\Admin) {
            if ($complaint->assigned_to !== $user->id) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }
            // Count unread messages from user
            $count = ComplaintMessage::where('complaint_id', $complaintId)
                ->where('sender_type', 'user')
                ->where('is_read', false)
                ->count();
        } else {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json(['unread_count' => $count], 200);
    }
}
