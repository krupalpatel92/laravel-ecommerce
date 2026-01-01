<?php

declare(strict_types=1);

namespace App\Actions\Cart;

use App\Models\CartItem;
use Exception;
use Illuminate\Support\Facades\DB;

class UpdateCartItemAction
{
    /**
     * Update cart item quantity with stock validation
     *
     * Returns null if quantity is 0 (item deleted)
     */
    public function execute(CartItem $cartItem, int $quantity): ?CartItem
    {
        return DB::transaction(function () use ($cartItem, $quantity) {
            // Remove if quantity is 0 or negative
            if ($quantity <= 0) {
                $cart = $cartItem->cart;
                $cartItem->delete();
                $cart->updateExpiration();

                return null;
            }

            // Check stock availability
            $availableStock = $cartItem->getAvailableStock();

            if ($quantity > $availableStock) {
                throw new Exception("Only {$availableStock} items available");
            }

            // Update quantity
            $cartItem->quantity = $quantity;
            $cartItem->save();

            $cartItem->cart->updateExpiration();

            return $cartItem->fresh(['product.media', 'variation']);
        });
    }
}
