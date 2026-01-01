<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicProductResource extends JsonResource
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
            'price_range' => $this->when($this->type === 'variable', [
                'min' => $this->getMinPrice(),
                'max' => $this->getMaxPrice(),
            ]),
            'stock_quantity' => $this->stock_quantity,
            'stock_status' => $this->stock_quantity > 0 ? 'in_stock' : 'out_of_stock',
            'primary_image_url' => $this->getPrimaryImageUrl('thumb'),
            'categories' => $this->whenLoaded('categories', function () {
                return $this->categories->map(fn ($cat) => [
                    'id' => $cat->id,
                    'name' => $cat->name,
                    'slug' => $cat->slug,
                ]);
            }),
        ];
    }
}
