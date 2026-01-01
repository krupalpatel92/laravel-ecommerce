<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'type' => $this->type,
            'price' => (float) $this->price,
            'stock_quantity' => $this->stock_quantity,
            'alert_threshold' => $this->alert_threshold,
            'status' => $this->status,
            'is_low_stock' => $this->stock_quantity <= $this->alert_threshold,
            'is_out_of_stock' => $this->stock_quantity === 0,
            'categories' => $this->whenLoaded('categories', fn () => CategoryResource::collection($this->categories)),
            'variations' => $this->whenLoaded('variations', fn () => ProductVariationResource::collection($this->variations)),
            'media' => $this->whenLoaded('media', fn () => MediaResource::collection($this->getMedia('product-images'))),
            'primary_image_url' => $this->getPrimaryImageUrl(),
            'primary_image_thumb_url' => $this->getPrimaryImageUrl('thumb'),
            'primary_image_medium_url' => $this->getPrimaryImageUrl('medium'),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
