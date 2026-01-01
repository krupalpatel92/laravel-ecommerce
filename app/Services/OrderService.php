<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderAddress;
use App\Models\OrderItem;

class OrderService
{
    /**
     * Generate a unique order number.
     */
    public function generateOrderNumber(): string
    {
        do {
            $date = now()->format('Ymd');
            $random = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            $orderNumber = "ORD-{$date}-{$random}";
        } while (Order::where('order_number', $orderNumber)->exists());

        return $orderNumber;
    }

    /**
     * Calculate order total from cart.
     */
    public function calculateOrderTotal(Cart $cart): float
    {
        $cart->load(['items.product', 'items.variation']);

        $subtotal = $cart->items->sum(function ($item) {
            return $item->getSubtotal();
        });

        return (float) $subtotal;
    }

    /**
     * Create order from cart.
     */
    public function createOrderFromCart(Cart $cart, array $addresses, ?int $userId = null, ?string $stripeIntentId = null): Order
    {
        $order = Order::create([
            'user_id' => $userId,
            'order_number' => $this->generateOrderNumber(),
            'total' => $this->calculateOrderTotal($cart),
            'status' => 'pending',
            'payment_status' => 'pending',
            'stripe_payment_intent_id' => $stripeIntentId,
        ]);

        return $order;
    }

    /**
     * Create order items from cart items.
     */
    public function createOrderItems(Order $order, Cart $cart): void
    {
        $cart->load(['items.product', 'items.variation']);

        foreach ($cart->items as $cartItem) {
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $cartItem->product_id,
                'variation_id' => $cartItem->variation_id,
                'quantity' => $cartItem->quantity,
                'price' => $cartItem->price,
            ]);
        }
    }

    /**
     * Create order addresses from provided addresses.
     */
    public function createOrderAddresses(Order $order, array $addresses): void
    {
        if (isset($addresses['shipping'])) {
            OrderAddress::create(array_merge(
                $addresses['shipping'],
                [
                    'order_id' => $order->id,
                    'type' => 'shipping',
                ]
            ));
        }

        if (isset($addresses['billing'])) {
            OrderAddress::create(array_merge(
                $addresses['billing'],
                [
                    'order_id' => $order->id,
                    'type' => 'billing',
                ]
            ));
        }
    }

    /**
     * Update order status.
     */
    public function updateOrderStatus(Order $order, string $status): Order
    {
        $order->update(['status' => $status]);

        return $order->fresh();
    }

    /**
     * Update payment status.
     */
    public function updatePaymentStatus(Order $order, string $paymentStatus, ?string $intentId = null): Order
    {
        $data = ['payment_status' => $paymentStatus];

        if ($intentId !== null) {
            $data['stripe_payment_intent_id'] = $intentId;
        }

        $order->update($data);

        return $order->fresh();
    }

    /**
     * Cancel order.
     */
    public function cancelOrder(Order $order): Order
    {
        if (! $order->canBeCancelled()) {
            throw new \Exception('Order cannot be cancelled in current status.');
        }

        return $this->updateOrderStatus($order, 'cancelled');
    }
}
