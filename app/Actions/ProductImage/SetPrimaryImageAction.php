<?php

declare(strict_types=1);

namespace App\Actions\ProductImage;

use App\Models\Product;

class SetPrimaryImageAction
{
    /**
     * Set a product image as primary
     */
    public function execute(Product $product, int $mediaId): bool
    {
        return $product->setPrimaryImage($mediaId);
    }
}
