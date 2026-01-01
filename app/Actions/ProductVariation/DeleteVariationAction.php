<?php

declare(strict_types=1);

namespace App\Actions\ProductVariation;

use App\Models\ProductVariation;

class DeleteVariationAction
{
    public function execute(ProductVariation $variation): bool
    {
        return $variation->delete();
    }
}
