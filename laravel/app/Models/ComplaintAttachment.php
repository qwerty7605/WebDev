<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ComplaintAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'complaint_id',
        'file_name',
        'file_path',
        'mime_type',
        'file_size',
    ];

    /**
     * Get the complaint that owns the attachment.
     */
    public function complaint()
    {
        return $this->belongsTo(Complaint::class);
    }

    /**
     * Get the full URL for the attachment.
     */
    public function getUrlAttribute()
    {
        return asset('storage/' . $this->file_path);
    }
}
