<?php

declare(strict_types=1);

namespace App\Actions\Cart;

use App\Models\Cart;
use Illuminate\Support\Facades\DB;

class MergeCartAction
{
    /**
     * Merge guest cart into user cart when logging in
     */
    public function execute(Cart $guestCart, ?Cart $userCart): Cart
    {
        return DB::transaction(function () use ($guestCart, $userCart) {
            // If user has no cart, convert guest cart to user cart
            if (! $userCart) {
                $guestCart->user_id = auth()->id();
                $guestCart->session_id = null;
                $guestCart->expires_at = null;
                $guestCart->save();

                return $guestCart->load(['items.product.media', 'items.variation']);
            }

            // Merge items from guest cart to user cart
            foreach ($guestCart->items as $guestItem) {
                $existingItem = $userCart->findItem(
                    $guestItem->product_id,
                    $guestItem->variation_id
                );

                if ($existingItem) {
                    // Combine quantities
                    $newQuantity = $existingItem->quantity + $guestItem->quantity;
                    $availableStock = $guestItem->getAvailableStock();

                    // Cap at available stock
                    $existingItem->quantity = min($newQuantity, $availableStock);
                    $existingItem->save();
                } else {
                    // Move item to user cart
                    $guestItem->cart_id = $userCart->id;
                    $guestItem->save();
                }
            }

            // Delete guest cart
            $guestCart->items()->delete();
            $guestCart->delete();

            $userCart->updateExpiration();

            return $userCart->load(['items.product.media', 'items.variation']);
        });
    }
}
