<?php

declare(strict_types=1);

namespace App\Models;

use Cviebrock\EloquentSluggable\Sluggable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Product extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia, LogsActivity, Sluggable;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'type',
        'price',
        'stock_quantity',
        'alert_threshold',
        'status',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'stock_quantity' => 'integer',
        'alert_threshold' => 'integer',
    ];

    public function sluggable(): array
    {
        return [
            'slug' => [
                'source' => 'name',
            ],
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'price', 'stock_quantity', 'status'])
            ->logOnlyDirty();
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('product-images')
            ->useFallbackUrl('/images/product-placeholder.png')
            ->registerMediaConversions(function () {
                $this->addMediaConversion('thumb')
                    ->width(150)
                    ->height(150)
                    ->sharpen(10)
                    ->nonQueued();

                $this->addMediaConversion('medium')
                    ->width(600)
                    ->height(600)
                    ->sharpen(10)
                    ->nonQueued();

                $this->addMediaConversion('large')
                    ->width(1200)
                    ->height(1200)
                    ->sharpen(10)
                    ->nonQueued();
            });
    }

    /**
     * Get the primary product image URL
     */
    public function getPrimaryImageUrl(string $conversion = ''): ?string
    {
        $media = $this->getMedia('product-images')
            ->sortBy('order_column')
            ->first(function ($item) {
                return $item->getCustomProperty('is_primary', false) === true;
            });

        if (! $media) {
            $media = $this->getFirstMedia('product-images');
        }

        return $media ? $media->getUrl($conversion) : null;
    }

    /**
     * Set a media item as primary
     */
    public function setPrimaryImage(int $mediaId): bool
    {
        // Remove primary from all images
        $this->getMedia('product-images')->each(function ($media) {
            $media->setCustomProperty('is_primary', false);
            $media->save();
        });

        // Set the specified image as primary
        $media = $this->getMedia('product-images')->firstWhere('id', $mediaId);

        if ($media) {
            $media->setCustomProperty('is_primary', true);
            $media->save();

            return true;
        }

        return false;
    }

    /**
     * Check if product has images
     */
    public function hasImages(): bool
    {
        return $this->getMedia('product-images')->isNotEmpty();
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class);
    }

    public function variations(): HasMany
    {
        return $this->hasMany(ProductVariation::class);
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function stockAlerts(): HasMany
    {
        return $this->hasMany(StockAlert::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeLowStock($query)
    {
        return $query->whereColumn('stock_quantity', '<=', 'alert_threshold');
    }

    public function scopeOutOfStock($query)
    {
        return $query->where('stock_quantity', 0);
    }

    public function scopeSingle($query)
    {
        return $query->where('type', 'single');
    }

    public function scopeVariable($query)
    {
        return $query->where('type', 'variable');
    }

    public function isLowStock(): bool
    {
        return $this->stock_quantity <= $this->alert_threshold;
    }

    public function isOutOfStock(): bool
    {
        return $this->stock_quantity === 0;
    }

    /**
     * Get minimum price for variable products
     */
    public function getMinPrice(): ?string
    {
        if ($this->type === 'single') {
            return $this->price;
        }

        return $this->variations()->min('price');
    }

    /**
     * Get maximum price for variable products
     */
    public function getMaxPrice(): ?string
    {
        if ($this->type === 'single') {
            return $this->price;
        }

        return $this->variations()->max('price');
    }
}
