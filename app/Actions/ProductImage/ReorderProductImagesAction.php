<?php

declare(strict_types=1);

namespace App\Actions\ProductImage;

use App\Models\Product;

class ReorderProductImagesAction
{
    /**
     * Reorder product images
     *
     * @param  array<int>  $order  Array of media IDs in desired order
     */
    public function execute(Product $product, array $order): bool
    {
        $media = $product->getMedia('product-images');

        foreach ($order as $index => $mediaId) {
            $mediaItem = $media->firstWhere('id', $mediaId);

            if ($mediaItem) {
                $mediaItem->order_column = $index + 1;
                $mediaItem->save();
            }
        }

        return true;
    }
}
