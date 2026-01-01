<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Actions\Cart\MergeCartAction;
use App\Models\Cart;
use App\Services\CartService;
use Laravel\Fortify\Events\Login;

class MergeGuestCartListener
{
    public function __construct(
        private CartService $cartService,
        private MergeCartAction $mergeCartAction
    ) {}

    public function handle(Login $event): void
    {
        // Get guest session ID from cookie
        $sessionId = $this->cartService->getSessionId();

        if (! $sessionId) {
            return; // No guest session, nothing to merge
        }

        // Find guest cart with items
        $guestCart = Cart::query()
            ->where('session_id', $sessionId)
            ->whereNull('user_id')
            ->with('items.product', 'items.variation')
            ->first();

        if (! $guestCart || $guestCart->items->isEmpty()) {
            // No guest cart or no items, clear session and return
            $this->cartService->clearSessionId();

            return;
        }

        // Find user's existing cart
        $userCart = Cart::query()
            ->where('user_id', $event->user->id)
            ->with('items.product', 'items.variation')
            ->first();

        // Merge carts
        $this->mergeCartAction->execute($guestCart, $userCart);

        // Clear guest session cookie
        $this->cartService->clearSessionId();

        // Flash success message for frontend
        $itemCount = $guestCart->items->count();
        $message = "Added {$itemCount} ".($itemCount === 1 ? 'item' : 'items').' from your previous session';

        session()->flash('cart_merged', $message);
    }
}
