<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Models\Cart;
use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\Cookie;

class ConvertGuestCartToUserCart
{
    /**
     * Handle the event.
     */
    public function handle(Login $event): void
    {
        $user = $event->user;

        // Get guest session ID from cookie
        $sessionId = Cookie::get('cart_session');

        if (! $sessionId) {
            return;
        }

        // Find guest cart
        $guestCart = Cart::where('session_id', $sessionId)
            ->whereNull('user_id')
            ->with('items')
            ->first();

        if (! $guestCart) {
            return;
        }

        // Check if user already has a cart
        $userCart = Cart::where('user_id', $user->id)->first();

        if ($userCart) {
            // Merge guest cart items into user cart
            foreach ($guestCart->items as $guestItem) {
                // Check if item already exists in user cart
                $existingItem = $userCart->items()
                    ->where('product_id', $guestItem->product_id)
                    ->where('variation_id', $guestItem->variation_id)
                    ->first();

                if ($existingItem) {
                    // Update quantity
                    $existingItem->update([
                        'quantity' => $existingItem->quantity + $guestItem->quantity,
                    ]);
                } else {
                    // Move item to user cart
                    $guestItem->update(['cart_id' => $userCart->id]);
                }
            }

            // Delete empty guest cart
            $guestCart->delete();
        } else {
            // Convert guest cart to user cart
            $guestCart->update([
                'user_id' => $user->id,
                'session_id' => null,
                'expires_at' => null,
            ]);
        }
    }
}
