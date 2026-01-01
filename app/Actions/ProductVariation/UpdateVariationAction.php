<?php

declare(strict_types=1);

namespace App\Actions\ProductVariation;

use App\Models\ProductVariation;

class UpdateVariationAction
{
    public function execute(ProductVariation $variation, array $data): ProductVariation
    {
        $variation->update($data);

        return $variation->fresh();
    }
}
