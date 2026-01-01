<?php

declare(strict_types=1);

namespace App\Actions\Product;

use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DeleteProductAction
{
    public function execute(Product $product): void
    {
        DB::transaction(function () use ($product) {
            if ($product->orderItems()->exists()) {
                throw ValidationException::withMessages([
                    'product' => 'Cannot delete product that has existing orders',
                ]);
            }

            $product->clearMediaCollection();

            $product->delete();
        });
    }
}
