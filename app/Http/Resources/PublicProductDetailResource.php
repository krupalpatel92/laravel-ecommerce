<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicProductDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'type' => $this->type,
            'price' => $this->when($this->type === 'single', $this->price),
            'sku' => $this->when($this->type === 'single', $this->sku),
            'stock_quantity' => $this->stock_quantity,
            'stock_status' => $this->stock_quantity > 0 ? 'in_stock' : 'out_of_stock',
            'alert_threshold' => $this->alert_threshold,
            'images' => $this->whenLoaded('media', function () {
                return $this->media->map(fn ($media) => [
                    'id' => $media->id,
                    'url' => $media->getUrl(),
                    'thumb_url' => $media->getUrl('thumb'),
                    'is_primary' => $media->getCustomProperty('is_primary', false),
                ]);
            }),
            'variations' => $this->whenLoaded('variations', function () {
                return $this->variations->map(fn ($variation) => [
                    'id' => $variation->id,
                    'name' => $variation->name,
                    'sku' => $variation->sku,
                    'price' => $variation->price,
                    'stock_quantity' => $variation->stock_quantity,
                    'attributes' => $variation->attributes,
                ]);
            }),
            'categories' => $this->whenLoaded('categories', function () {
                return $this->categories->map(fn ($cat) => [
                    'id' => $cat->id,
                    'name' => $cat->name,
                    'slug' => $cat->slug,
                    'parent' => $cat->parent ? [
                        'id' => $cat->parent->id,
                        'name' => $cat->parent->name,
                        'slug' => $cat->parent->slug,
                    ] : null,
                ]);
            }),
        ];
    }
}
