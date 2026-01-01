<?php

declare(strict_types=1);

namespace App\Actions\Cart;

use App\Models\CartItem;
use Illuminate\Support\Facades\DB;

class RemoveFromCartAction
{
    /**
     * Remove item from cart
     */
    public function execute(CartItem $cartItem): void
    {
        DB::transaction(function () use ($cartItem) {
            $cart = $cartItem->cart;
            $cartItem->delete();
            $cart->updateExpiration();
        });
    }
}
