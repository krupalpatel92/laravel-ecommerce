<?php

declare(strict_types=1);

namespace App\Actions\ProductImage;

use App\Models\Product;
use Illuminate\Support\Collection;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class UploadProductImageAction
{
    /**
     * Upload product images
     *
     * @param  array<int, \Illuminate\Http\UploadedFile>  $images
     * @return Collection<int, Media>
     */
    public function execute(Product $product, array $images): Collection
    {
        $uploadedMedia = collect();

        foreach ($images as $index => $image) {
            $media = $product->addMedia($image)
                ->toMediaCollection('product-images');

            // Set first image as primary if no primary image exists
            if ($index === 0 && ! $this->hasPrimaryImage($product)) {
                $media->setCustomProperty('is_primary', true);
                $media->save();
            }

            $uploadedMedia->push($media);
        }

        return $uploadedMedia;
    }

    /**
     * Check if product has a primary image
     */
    private function hasPrimaryImage(Product $product): bool
    {
        return $product->getMedia('product-images')
            ->contains(function ($media) {
                return $media->getCustomProperty('is_primary', false) === true;
            });
    }
}
