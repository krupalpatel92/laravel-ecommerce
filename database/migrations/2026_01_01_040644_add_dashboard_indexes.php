<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->index(['payment_status', 'created_at']);
            $table->index(['status', 'created_at']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->index(['stock_quantity', 'alert_threshold']);
        });

        Schema::table('product_variations', function (Blueprint $table) {
            $table->index(['stock_quantity', 'product_id']);
        });

        Schema::table('carts', function (Blueprint $table) {
            $table->index(['expires_at', 'updated_at']);
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->index(['product_id', 'order_id']);
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['payment_status', 'created_at']);
            $table->dropIndex(['status', 'created_at']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['stock_quantity', 'alert_threshold']);
        });

        Schema::table('product_variations', function (Blueprint $table) {
            $table->dropIndex(['stock_quantity', 'product_id']);
        });

        Schema::table('carts', function (Blueprint $table) {
            $table->dropIndex(['expires_at', 'updated_at']);
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropIndex(['product_id', 'order_id']);
        });
    }
};
