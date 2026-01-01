<?php

declare(strict_types=1);

namespace App\Actions\ProductImage;

use App\Models\Product;

class DeleteProductImageAction
{
    /**
     * Delete a product image
     */
    public function execute(Product $product, int $mediaId): bool
    {
        $media = $product->getMedia('product-images')->firstWhere('id', $mediaId);

        if (! $media) {
            return false;
        }

        $wasPrimary = $media->getCustomProperty('is_primary', false) === true;

        $media->delete();

        // If deleted image was primary, set first remaining image as primary
        if ($wasPrimary) {
            $firstMedia = $product->getFirstMedia('product-images');
            if ($firstMedia) {
                $firstMedia->setCustomProperty('is_primary', true);
                $firstMedia->save();
            }
        }

        return true;
    }
}
