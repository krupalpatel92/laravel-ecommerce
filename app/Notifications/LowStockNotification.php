<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\Product;
use App\Models\ProductVariation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LowStockNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public Product $product,
        public ?ProductVariation $variation = null
    ) {}

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $productName = $this->product->name;
        $currentStock = $this->variation
            ? $this->variation->stock_quantity
            : $this->product->stock_quantity;
        $threshold = $this->variation
            ? $this->variation->alert_threshold
            : $this->product->alert_threshold;
        $sku = $this->variation ? $this->variation->sku : $this->product->slug;

        $url = route('admin.products.edit', $this->product->id);

        $message = (new MailMessage)
            ->subject("⚠️ Low Stock Alert: {$productName}")
            ->greeting('Hello Admin,')
            ->line('The following product is running low on stock:')
            ->line("**Product:** {$productName}");

        if ($this->variation) {
            $message->line("**Variation:** {$this->variation->name}");
        }

        $message->line("**SKU:** {$sku}")
            ->line("**Current Stock:** {$currentStock} units")
            ->line("**Alert Threshold:** {$threshold} units")
            ->line('⚠️ **Status:** Low Stock - Immediate attention required!')
            ->action('View Product', $url)
            ->line('Please restock this item as soon as possible.');

        return $message;
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'product_id' => $this->product->id,
            'product_name' => $this->product->name,
            'variation_id' => $this->variation?->id,
            'variation_name' => $this->variation?->name,
            'current_stock' => $this->variation
                ? $this->variation->stock_quantity
                : $this->product->stock_quantity,
            'alert_threshold' => $this->variation
                ? $this->variation->alert_threshold
                : $this->product->alert_threshold,
        ];
    }
}
