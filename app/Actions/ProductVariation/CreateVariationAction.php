<?php

declare(strict_types=1);

namespace App\Actions\ProductVariation;

use App\Models\Product;
use App\Models\ProductVariation;

class CreateVariationAction
{
    public function execute(Product $product, array $data): ProductVariation
    {
        $data['product_id'] = $product->id;

        return ProductVariation::create($data);
    }
}
