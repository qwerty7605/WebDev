<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Sanctum\HasApiTokens;

class Admin extends Authenticatable
{
    use HasFactory, HasApiTokens;

    protected $fillable = [
        'username',
        'email',
        'password',
        'full_name',
        'role',
        'last_login',
        'is_active',
    ];

    protected $hidden = [
        'password',
    ];

    protected function casts(): array
    {
        return [
            'last_login' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the complaint updates for the admin.
     */
    public function complaintUpdates()
    {
        return $this->hasMany(ComplaintUpdate::class);
    }

    /**
     * Get the sessions for the admin.
     */
    public function sessions()
    {
        return $this->hasMany(AdminSession::class);
    }
}
