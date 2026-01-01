<?php

declare(strict_types=1);

namespace App\Actions\Cart;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariation;
use Exception;
use Illuminate\Support\Facades\DB;

class AddToCartAction
{
    /**
     * Add product/variation to cart with stock validation
     */
    public function execute(
        Cart $cart,
        int $productId,
        ?int $variationId = null,
        int $quantity = 1
    ): CartItem {
        return DB::transaction(function () use ($cart, $productId, $variationId, $quantity) {
            // Load product
            $product = Product::findOrFail($productId);

            // Validate product is published
            if ($product->status !== 'published') {
                throw new Exception('Product is not available for purchase');
            }

            // Handle variation
            $variation = null;
            $price = $product->price;

            if ($product->type === 'variable') {
                if (! $variationId) {
                    throw new Exception('Please select product options');
                }

                $variation = ProductVariation::findOrFail($variationId);

                if ($variation->product_id !== $productId) {
                    throw new Exception('Invalid variation for this product');
                }

                $price = $variation->price;
            }

            // Check stock availability
            $availableStock = $variation ? $variation->stock_quantity : $product->stock_quantity;

            // Check if item already exists in cart
            $existingItem = $cart->findItem($productId, $variationId);

            // Calculate available stock considering cart quantity
            $currentCartQuantity = $existingItem ? $existingItem->quantity : 0;
            $maxAddableQuantity = $availableStock - $currentCartQuantity;

            if ($availableStock <= 0) {
                throw new Exception('Product is out of stock');
            }

            if ($maxAddableQuantity < $quantity) {
                $productName = $variation ? "{$product->name} - {$variation->name}" : $product->name;
                throw new Exception("Only {$maxAddableQuantity} units of '{$productName}' available to add. Current stock: {$availableStock} units.");
            }

            if ($existingItem) {
                // Update quantity
                $existingItem->quantity += $quantity;
                $existingItem->save();

                $cart->updateExpiration();

                return $existingItem->load(['product.media', 'variation']);
            }

            // Create new cart item
            $cartItem = CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $productId,
                'variation_id' => $variationId,
                'quantity' => $quantity,
                'price' => $price, // Snapshot price at time of adding
            ]);

            $cart->updateExpiration();

            return $cartItem->load(['product.media', 'variation']);
        });
    }
}
