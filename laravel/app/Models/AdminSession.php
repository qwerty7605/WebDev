<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AdminSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'admin_id',
        'session_token',
        'ip_address',
        'user_agent',
        'login_time',
        'logout_time',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'login_time' => 'datetime',
            'logout_time' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the admin that owns the session.
     */
    public function admin()
    {
        return $this->belongsTo(Admin::class);
    }
}
