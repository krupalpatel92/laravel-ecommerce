<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE products MODIFY COLUMN status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft'");
        } else {
            // For SQLite and other databases, recreate the column
            Schema::table('products', function (Blueprint $table) {
                $table->string('status')->default('draft')->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE products MODIFY COLUMN status ENUM('active', 'inactive', 'out_of_stock') NOT NULL DEFAULT 'active'");
        } else {
            Schema::table('products', function (Blueprint $table) {
                $table->string('status')->default('active')->change();
            });
        }
    }
};
