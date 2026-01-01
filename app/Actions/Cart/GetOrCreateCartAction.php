<?php

declare(strict_types=1);

namespace App\Actions\Cart;

use App\Models\Cart;
use InvalidArgumentException;

class GetOrCreateCartAction
{
    /**
     * Get existing cart or create new one for user or guest
     */
    public function execute(?int $userId = null, ?string $sessionId = null): Cart
    {
        if (! $userId && ! $sessionId) {
            throw new InvalidArgumentException('Either userId or sessionId must be provided');
        }

        // Try to find existing cart
        $cart = Cart::query()
            ->when($userId, fn ($q) => $q->where('user_id', $userId))
            ->when($sessionId && ! $userId, fn ($q) => $q->where('session_id', $sessionId)->whereNull('user_id'))
            ->with(['items.product.media', 'items.variation'])
            ->first();

        // Create if not found
        if (! $cart) {
            $cart = Cart::create([
                'user_id' => $userId,
                'session_id' => $sessionId,
                'expires_at' => $userId ? null : now()->addHours(24),
            ]);

            $cart->load(['items.product.media', 'items.variation']);
        }

        return $cart;
    }
}
