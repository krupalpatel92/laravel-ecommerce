<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        // Create superadmin user
        $superadmin = User::firstOrCreate(
            ['email' => 'admin@laravel-ecom.com'],
            [
                'name' => 'Super Admin',
                'email' => 'admin@laravel-ecom.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // Assign superadmin role
        $superadminRole = Role::where('name', 'superadmin')->first();

        if ($superadminRole && ! $superadmin->hasRole('superadmin')) {
            $superadmin->assignRole($superadminRole);
        }

        $this->command->info('Superadmin user created successfully!');
        $this->command->info('Email: admin@laravel-ecom.com');
        $this->command->info('Password: password');
    }
}
