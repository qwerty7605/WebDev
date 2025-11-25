<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ComplaintCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_name',
        'description',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the complaints for the category.
     */
    public function complaints()
    {
        return $this->hasMany(Complaint::class, 'category_id');
    }
}
