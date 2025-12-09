<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Complaint extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'is_anonymous',
        'category_id',
        'assigned_to',
        'complaint_number',
        'subject',
        'description',
        'priority',
        'status',
        'attachment_path',
        'resolved_at',
    ];

    protected function casts(): array
    {
        return [
            'is_anonymous' => 'boolean',
            'resolved_at' => 'datetime',
        ];
    }

    /**
     * Get the user that owns the complaint.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the category of the complaint.
     */
    public function category()
    {
        return $this->belongsTo(ComplaintCategory::class, 'category_id');
    }

    /**
     * Get the admin assigned to the complaint.
     */
    public function assignedAdmin()
    {
        return $this->belongsTo(Admin::class, 'assigned_to');
    }

    /**
     * Get the updates for the complaint.
     */
    public function updates()
    {
        return $this->hasMany(ComplaintUpdate::class);
    }

    /**
     * Get the messages for the complaint.
     */
    public function messages()
    {
        return $this->hasMany(ComplaintMessage::class);
    }
}
