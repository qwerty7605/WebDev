<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\ComplaintCategory;
use App\Models\ComplaintAttachment;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ComplaintController extends Controller
{
    /**
     * Get all categories
     */
    public function getCategories()
    {
        $categories = ComplaintCategory::where('is_active', true)->get();

        return response()->json([
            'categories' => $categories
        ], 200);
    }

    /**
     * Submit a new complaint (User only)
     */
    public function store(Request $request)
    {
        $request->validate([
            'category_id' => 'required|exists:complaint_categories,id',
            'subject' => 'required|string|max:255',
            'description' => 'required|string',
            'assigned_to' => 'nullable|exists:admins,id',
            'is_anonymous' => 'nullable|boolean',
            'attachment' => 'nullable|file|mimes:jpeg,jpg,png,mp4,mov,avi,wmv,webm|max:51200', // max 50MB
        ]);

        $user = $request->user();

        // Generate unique complaint number
        $complaintNumber = 'CMP-' . date('Ymd') . '-' . strtoupper(Str::random(6));

        // Create the complaint first
        $complaint = Complaint::create([
            'user_id' => $user->id,
            'is_anonymous' => $request->is_anonymous ?? false,
            'category_id' => $request->category_id,
            'complaint_number' => $complaintNumber,
            'subject' => $request->subject,
            'description' => $request->description,
            'priority' => 'Medium',
            'status' => 'Pending',
            'assigned_to' => $request->assigned_to,
        ]);

        // Handle file upload and create attachment record
        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $filePath = $file->storeAs('complaints', $filename, 'public');

            // Create attachment record
            ComplaintAttachment::create([
                'complaint_id' => $complaint->id,
                'file_name' => $file->getClientOriginalName(),
                'file_path' => $filePath,
                'mime_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
            ]);
        }

        $complaint->load(['category', 'user', 'assignedAdmin', 'attachment']);

        return response()->json([
            'message' => 'Complaint submitted successfully',
            'complaint' => $complaint
        ], 201);
    }

    /**
     * Get user's complaints
     */
    public function getUserComplaints(Request $request)
    {
        $user = $request->user();

        $complaints = Complaint::where('user_id', $user->id)
            ->with(['category', 'assignedAdmin', 'updates.admin', 'attachment'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'complaints' => $complaints
        ], 200);
    }

    /**
     * Get single complaint details
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();

        $query = Complaint::with(['category', 'user', 'assignedAdmin', 'updates.admin', 'attachment'])
            ->where('id', $id);

        // Only filter by user_id if the authenticated user is not an admin
        if (!($user instanceof \App\Models\Admin)) {
            $query->where('user_id', $user->id);
        }

        $complaint = $query->firstOrFail();

        return response()->json([
            'complaint' => $complaint
        ], 200);
    }

    /**
     * Delete complaint (User only - Pending complaints only)
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        $complaint = Complaint::where('id', $id)
            ->where('user_id', $user->id)
            ->with('attachment')
            ->firstOrFail();

        // Only allow deletion of pending complaints
        if ($complaint->status !== 'Pending') {
            return response()->json([
                'message' => 'Only pending complaints can be deleted. This complaint is already ' . $complaint->status . '.'
            ], 403);
        }

        // Delete attachment file if exists
        if ($complaint->attachment) {
            \Storage::disk('public')->delete($complaint->attachment->file_path);
            $complaint->attachment->delete();
        }

        $complaint->delete();

        return response()->json([
            'message' => 'Complaint deleted successfully'
        ], 200);
    }

    /**
     * Get all complaints (Admin only)
     */
    public function getAllComplaints(Request $request)
    {
        $status = $request->query('status');
        $category = $request->query('category');

        $query = Complaint::with(['category', 'user', 'assignedAdmin', 'updates', 'attachment']);

        if ($status) {
            $query->where('status', $status);
        }

        if ($category) {
            $query->where('category_id', $category);
        }

        $complaints = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'complaints' => $complaints
        ], 200);
    }

    /**
     * Update complaint status (Admin only)
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:Pending,In Progress,Resolved',
            'comments' => 'nullable|string',
            'resolution_details' => 'nullable|string',
        ]);

        $complaint = Complaint::findOrFail($id);
        $admin = $request->user();

        $previousStatus = $complaint->status;
        $complaint->status = $request->status;

        if ($request->status === 'Resolved') {
            $complaint->resolved_at = now();
        }

        $complaint->save();

        // Create update record
        $complaint->updates()->create([
            'admin_id' => $admin->id,
            'previous_status' => $previousStatus,
            'new_status' => $request->status,
            'comments' => $request->comments,
            'resolution_details' => $request->resolution_details,
        ]);

        $complaint->load(['category', 'user', 'updates.admin', 'attachment']);

        return response()->json([
            'message' => 'Complaint status updated successfully',
            'complaint' => $complaint
        ], 200);
    }

    /**
     * Get complaint statistics (Admin only)
     */
    public function getStatistics()
    {
        $stats = [
            'total' => Complaint::count(),
            'pending' => Complaint::where('status', 'Pending')->count(),
            'in_progress' => Complaint::where('status', 'In Progress')->count(),
            'resolved' => Complaint::where('status', 'Resolved')->count(),
            'by_category' => Complaint::selectRaw('category_id, count(*) as count')
                ->groupBy('category_id')
                ->with('category:id,category_name')
                ->get(),
        ];

        return response()->json($stats, 200);
    }
}
