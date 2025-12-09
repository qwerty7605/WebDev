<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ComplaintMessage extends Model
{
    protected $fillable = [
        'complaint_id',
        'sender_id',
        'sender_type',
        'message',
        'attachment_path',
        'is_read',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the complaint this message belongs to
     */
    public function complaint(): BelongsTo
    {
        return $this->belongsTo(Complaint::class);
    }

    /**
     * Get the sender (polymorphic - User or Admin)
     */
    public function sender()
    {
        if ($this->sender_type === 'user') {
            return $this->belongsTo(User::class, 'sender_id');
        }
        return $this->belongsTo(Admin::class, 'sender_id');
    }

    /**
     * Get user sender if sender_type is user
     */
    public function userSender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /**
     * Get admin sender if sender_type is admin
     */
    public function adminSender(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'sender_id');
    }
}
