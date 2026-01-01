<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Product;
use App\Models\ProductVariation;
use App\Models\StockAlert;
use App\Models\User;
use App\Notifications\LowStockNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Notification;

class CheckLowStockJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public ?int $productId = null
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Get all superadmin users to notify
        $superAdmins = User::role('superadmin')->get();

        if ($superAdmins->isEmpty()) {
            return;
        }

        // Check single products
        $this->checkSingleProducts($superAdmins);

        // Check product variations
        $this->checkProductVariations($superAdmins);
    }

    /**
     * Check single products for low stock.
     */
    protected function checkSingleProducts($superAdmins): void
    {
        $query = Product::where('type', 'single')
            ->whereColumn('stock_quantity', '<=', 'alert_threshold')
            ->where('stock_quantity', '>', 0); // Don't alert for out of stock

        if ($this->productId) {
            $query->where('id', $this->productId);
        }

        $lowStockProducts = $query->get();

        foreach ($lowStockProducts as $product) {
            // Check if alert already sent
            $alertExists = StockAlert::where('product_id', $product->id)
                ->whereNull('variation_id')
                ->where('alert_type', 'low_stock')
                ->exists();

            if (! $alertExists) {
                // Send notification
                Notification::send(
                    $superAdmins,
                    new LowStockNotification($product)
                );

                // Record alert
                StockAlert::create([
                    'product_id' => $product->id,
                    'variation_id' => null,
                    'alert_type' => 'low_stock',
                    'sent_at' => now(),
                ]);
            }
        }
    }

    /**
     * Check product variations for low stock.
     */
    protected function checkProductVariations($superAdmins): void
    {
        $query = ProductVariation::query()
            ->with('product')
            ->whereHas('product', function ($q) {
                $q->where('type', 'variable');
            });

        if ($this->productId) {
            $query->where('product_id', $this->productId);
        }

        $variations = $query->get();

        foreach ($variations as $variation) {
            $product = $variation->product;

            // Check if variation stock is below its own threshold
            if ($variation->stock_quantity <= $variation->alert_threshold
                && $variation->stock_quantity > 0) {

                // Check if alert already sent
                $alertExists = StockAlert::where('product_id', $product->id)
                    ->where('variation_id', $variation->id)
                    ->where('alert_type', 'low_stock')
                    ->exists();

                if (! $alertExists) {
                    // Send notification
                    Notification::send(
                        $superAdmins,
                        new LowStockNotification($product, $variation)
                    );

                    // Record alert
                    StockAlert::create([
                        'product_id' => $product->id,
                        'variation_id' => $variation->id,
                        'alert_type' => 'low_stock',
                        'sent_at' => now(),
                    ]);
                }
            }
        }
    }
}
