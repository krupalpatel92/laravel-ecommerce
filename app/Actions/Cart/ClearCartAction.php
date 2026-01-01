<?php

declare(strict_types=1);

namespace App\Actions\Cart;

use App\Models\Cart;
use Illuminate\Support\Facades\DB;

class ClearCartAction
{
    /**
     * Remove all items from cart
     */
    public function execute(Cart $cart): void
    {
        DB::transaction(function () use ($cart) {
            $cart->items()->delete();
            $cart->updateExpiration();
        });
    }
}
