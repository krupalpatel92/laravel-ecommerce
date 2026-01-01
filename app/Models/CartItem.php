<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartItem extends Model
{
    protected $fillable = [
        'cart_id',
        'product_id',
        'variation_id',
        'quantity',
        'price',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'price' => 'decimal:2',
    ];

    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function variation(): BelongsTo
    {
        return $this->belongsTo(ProductVariation::class, 'variation_id');
    }

    public function getSubtotal(): float
    {
        return $this->price * $this->quantity;
    }

    public function isAvailable(): bool
    {
        if ($this->variation_id) {
            return $this->variation && $this->variation->stock_quantity >= $this->quantity;
        }

        return $this->product && $this->product->stock_quantity >= $this->quantity;
    }

    public function getAvailableStock(): int
    {
        if ($this->variation_id) {
            return $this->variation?->stock_quantity ?? 0;
        }

        return $this->product?->stock_quantity ?? 0;
    }

    public function hasStockIssue(): bool
    {
        $availableStock = $this->getAvailableStock();

        return $this->quantity > $availableStock;
    }

    public function getDisplayName(): string
    {
        $name = $this->product->name;

        if ($this->variation) {
            $name .= ' - '.$this->variation->name;
        }

        return $name;
    }
}
