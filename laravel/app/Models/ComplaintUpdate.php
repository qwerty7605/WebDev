<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ComplaintUpdate extends Model
{
    use HasFactory;

    protected $fillable = [
        'complaint_id',
        'admin_id',
        'previous_status',
        'new_status',
        'comments',
        'resolution_details',
    ];

    /**
     * Get the complaint that owns the update.
     */
    public function complaint()
    {
        return $this->belongsTo(Complaint::class);
    }

    /**
     * Get the admin that created the update.
     */
    public function admin()
    {
        return $this->belongsTo(Admin::class);
    }
}
