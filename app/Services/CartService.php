<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Cart;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Str;

class CartService
{
    private const COOKIE_NAME = 'cart_session_id';

    private const COOKIE_LIFETIME = 60 * 24; // 24 hours in minutes

    /**
     * Get the current user's or guest's cart
     */
    public function getCurrentCart(): ?Cart
    {
        if (auth()->check()) {
            return $this->getUserCart(auth()->id());
        }

        return $this->getGuestCart();
    }

    /**
     * Get cart for a specific user
     */
    public function getUserCart(int $userId): ?Cart
    {
        return Cart::query()
            ->where('user_id', $userId)
            ->with(['items.product.media', 'items.variation'])
            ->latest()
            ->first();
    }

    /**
     * Get cart for current guest session
     */
    public function getGuestCart(): ?Cart
    {
        $sessionId = $this->getSessionId();

        if (! $sessionId) {
            return null;
        }

        return Cart::query()
            ->where('session_id', $sessionId)
            ->whereNull('user_id')
            ->with(['items.product.media', 'items.variation'])
            ->first();
    }

    /**
     * Get or create session ID for guest
     */
    public function getOrCreateSessionId(): string
    {
        $sessionId = $this->getSessionId();

        if (! $sessionId) {
            $sessionId = Str::uuid()->toString();
            $this->setSessionId($sessionId);
        }

        return $sessionId;
    }

    /**
     * Get session ID from cookie
     */
    public function getSessionId(): ?string
    {
        // Try to get from incoming request first
        $sessionId = request()->cookie(self::COOKIE_NAME);

        // Fallback to Cookie facade
        if (! $sessionId) {
            $sessionId = Cookie::get(self::COOKIE_NAME);
        }

        return $sessionId;
    }

    /**
     * Set session ID in cookie
     */
    public function setSessionId(string $sessionId): void
    {
        Cookie::queue(
            self::COOKIE_NAME,
            $sessionId,
            self::COOKIE_LIFETIME,
            '/',   // path
            null,  // domain
            config('session.secure', false),  // secure - use session config
            true,  // httpOnly
            false, // raw
            config('session.same_site', 'lax') // sameSite - use session config
        );
    }

    /**
     * Clear session ID cookie
     */
    public function clearSessionId(): void
    {
        Cookie::queue(Cookie::forget(self::COOKIE_NAME));
    }

    /**
     * Check if user is authenticated
     */
    public function isAuthenticated(): bool
    {
        return auth()->check();
    }
}
