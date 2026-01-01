<?php

declare(strict_types=1);

namespace App\Actions\Order;

use App\Models\Cart;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Support\Facades\DB;

class CreateOrderAction
{
    public function __construct(
        protected OrderService $orderService
    ) {}

    /**
     * Execute the action to create an order from cart.
     *
     * @param  array{cart_id: int, user_id: int|null, shipping_address: array, billing_address: array, stripe_payment_intent_id: string|null}  $data
     *
     * @throws \Exception
     */
    public function execute(array $data): Order
    {
        $cart = Cart::with(['items.product', 'items.variation'])
            ->findOrFail($data['cart_id']);

        if ($cart->items->isEmpty()) {
            throw new \Exception('Cannot create order from empty cart.');
        }

        foreach ($cart->items as $item) {
            $availableStock = $item->variation
                ? $item->variation->stock_quantity
                : $item->product->stock_quantity;

            if ($availableStock < $item->quantity) {
                throw new \Exception("Insufficient stock for {$item->product->name}.");
            }
        }

        return DB::transaction(function () use ($cart, $data) {
            $order = $this->orderService->createOrderFromCart(
                $cart,
                [
                    'shipping' => $data['shipping_address'],
                    'billing' => $data['billing_address'],
                ],
                $data['user_id'] ?? null,
                $data['stripe_payment_intent_id'] ?? null
            );

            $this->orderService->createOrderItems($order, $cart);

            $this->orderService->createOrderAddresses($order, [
                'shipping' => $data['shipping_address'],
                'billing' => $data['billing_address'],
            ]);

            return $order->load(['items.product', 'items.variation', 'addresses']);
        });
    }
}
