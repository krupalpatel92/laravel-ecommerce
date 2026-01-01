<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            // Product Management
            'manage-products',
            'view-products',

            // Category Management
            'manage-categories',

            // Order Management
            'manage-orders',
            'view-own-orders',

            // Inventory Management
            'manage-inventory',

            // Dashboard Access
            'view-admin-dashboard',
            'view-reports',

            // User Management (future)
            'manage-users',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission, 'guard_name' => 'web']
            );
        }

        $this->command->info('Permissions created successfully!');
    }
}
