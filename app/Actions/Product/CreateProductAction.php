<?php

declare(strict_types=1);

namespace App\Actions\Product;

use App\Models\Product;
use Illuminate\Support\Facades\DB;

class CreateProductAction
{
    public function execute(array $data): Product
    {
        return DB::transaction(function () use ($data) {
            $categoryIds = $data['category_ids'] ?? [];
            $variations = $data['variations'] ?? [];

            unset($data['category_ids'], $data['variations']);

            // For variable products, set default price and stock to 0
            if ($data['type'] === 'variable') {
                $data['price'] = 0;
                $data['stock_quantity'] = 0;
            }

            $product = Product::create($data);

            if (! empty($categoryIds)) {
                $product->categories()->attach($categoryIds);
            }

            // Create variations for variable products
            if ($product->type === 'variable' && ! empty($variations)) {
                foreach ($variations as $variationData) {
                    $product->variations()->create($variationData);
                }
            }

            $product->load(['categories', 'variations']);

            return $product;
        });
    }
}
