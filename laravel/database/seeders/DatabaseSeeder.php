<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Admin;
use App\Models\ComplaintCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create test user
        User::create([
            'username' => 'testuser',
            'email' => 'testuser@example.com',
            'password' => Hash::make('Test@123'),
            'full_name' => 'Test User',
            'contact_number' => '1234567890',
            'department' => 'IT',
            'is_active' => true,
        ]);

        // Create test admin
        Admin::create([
            'username' => 'admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('Admin@123'),
            'full_name' => 'System Administrator',
            'role' => 'admin',
            'is_active' => true,
        ]);

        // Create complaint categories
        $categories = [
            ['category_name' => 'IT Support', 'description' => 'Computer, network, and software issues'],
            ['category_name' => 'HR', 'description' => 'Human resources and employee relations'],
            ['category_name' => 'Maintenance', 'description' => 'Building and facility maintenance'],
            ['category_name' => 'Finance', 'description' => 'Financial and accounting matters'],
            ['category_name' => 'Safety', 'description' => 'Safety and security concerns'],
            ['category_name' => 'Other', 'description' => 'General complaints and inquiries'],
        ];

        foreach ($categories as $category) {
            ComplaintCategory::create([
                'category_name' => $category['category_name'],
                'description' => $category['description'],
                'is_active' => true,
            ]);
        }
    }
}
