<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cart extends Model
{
    protected $fillable = [
        'user_id',
        'session_id',
        'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function scopeExpired($query)
    {
        return $query->where('expires_at', '<', now());
    }

    public function scopeGuest($query)
    {
        return $query->whereNull('user_id')->whereNotNull('session_id');
    }

    public function scopeUser($query)
    {
        return $query->whereNotNull('user_id');
    }

    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    public function getTotal(): float
    {
        return $this->items->sum(fn ($item) => $item->price * $item->quantity);
    }

    public function getItemCount(): int
    {
        return $this->items->sum('quantity');
    }

    public function isEmpty(): bool
    {
        return $this->items->isEmpty();
    }

    public function hasItem(int $productId, ?int $variationId = null): bool
    {
        return $this->items()
            ->where('product_id', $productId)
            ->where('variation_id', $variationId)
            ->exists();
    }

    public function findItem(int $productId, ?int $variationId = null): ?CartItem
    {
        // Use loaded relationship if available to avoid N+1 queries
        if ($this->relationLoaded('items')) {
            return $this->items->first(function ($item) use ($productId, $variationId) {
                return $item->product_id === $productId
                    && $item->variation_id === $variationId;
            });
        }

        return $this->items()
            ->where('product_id', $productId)
            ->where('variation_id', $variationId)
            ->first();
    }

    public function updateExpiration(): void
    {
        if ($this->user_id) {
            $this->expires_at = null;
        } else {
            $this->expires_at = now()->addHours(24);
        }

        $this->save();
    }
}
