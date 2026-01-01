<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Get roles
        $superadminRole = Role::where('name', 'superadmin')->first();
        $customerRole = Role::where('name', 'customer')->first();

        // Superadmin gets all permissions
        $allPermissions = Permission::all();
        $superadminRole->syncPermissions($allPermissions);

        // Customer gets limited permissions
        $customerPermissions = [
            'view-products',
            'view-own-orders',
        ];

        $customerRole->syncPermissions($customerPermissions);

        $this->command->info('Permissions assigned to roles successfully!');
    }
}
