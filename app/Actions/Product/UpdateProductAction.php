<?php

declare(strict_types=1);

namespace App\Actions\Product;

use App\Jobs\CheckLowStockJob;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class UpdateProductAction
{
    public function execute(Product $product, array $data): Product
    {
        $originalStock = $product->stock_quantity;

        $result = DB::transaction(function () use ($product, $data) {
            $categoryIds = $data['category_ids'] ?? null;
            $variations = $data['variations'] ?? null;

            unset($data['category_ids'], $data['variations']);

            $product->update($data);

            if ($categoryIds !== null) {
                $product->categories()->sync($categoryIds);
            }

            // Sync variations for variable products
            if ($product->type === 'variable' && $variations !== null) {
                $this->syncVariations($product, $variations);
            }

            $product->load(['categories', 'variations']);

            return $product;
        });

        // Check for low stock if stock quantity was updated
        if (isset($data['stock_quantity']) && $data['stock_quantity'] !== $originalStock) {
            CheckLowStockJob::dispatch($result->id);
        }

        return $result;
    }

    protected function syncVariations(Product $product, array $variations): void
    {
        $variationIds = [];

        foreach ($variations as $variationData) {
            if (isset($variationData['id'])) {
                // Update existing variation
                $variation = $product->variations()->find($variationData['id']);
                if ($variation) {
                    $variation->update($variationData);
                    $variationIds[] = $variation->id;
                }
            } else {
                // Create new variation
                $variation = $product->variations()->create($variationData);
                $variationIds[] = $variation->id;
            }
        }

        // Delete variations that are not in the list
        $product->variations()->whereNotIn('id', $variationIds)->delete();
    }
}
