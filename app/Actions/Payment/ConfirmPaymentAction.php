<?php

declare(strict_types=1);

namespace App\Actions\Payment;

use App\Jobs\CheckLowStockJob;
use App\Models\Cart;
use App\Models\Order;
use App\Services\CartService;
use App\Services\PaymentService;
use Stripe\Exception\ApiErrorException;

class ConfirmPaymentAction
{
    public function __construct(
        protected PaymentService $paymentService,
        protected CartService $cartService
    ) {}

    /**
     * Execute the action to confirm payment.
     *
     * @param  array{order_id: int, payment_intent_id: string}  $data
     *
     * @throws \Exception
     * @throws ApiErrorException
     */
    public function execute(array $data): Order
    {
        $order = Order::with(['items.product', 'items.variation', 'addresses'])
            ->findOrFail($data['order_id']);

        if ($order->stripe_payment_intent_id !== $data['payment_intent_id']) {
            throw new \Exception('Payment intent does not match order.');
        }

        if ($order->payment_status === 'paid') {
            throw new \Exception('Order payment already confirmed.');
        }

        $paymentIntent = $this->paymentService->confirmPayment($data['payment_intent_id']);

        if ($paymentIntent->status !== 'succeeded') {
            throw new \Exception('Payment has not succeeded yet.');
        }

        $this->paymentService->handlePaymentSuccess($order, $data['payment_intent_id']);

        // Deduct stock for all order items
        foreach ($order->items as $item) {
            if ($item->variation_id) {
                // Deduct from variation stock
                $item->variation->decrement('stock_quantity', $item->quantity);
            } else {
                // Deduct from product stock
                $item->product->decrement('stock_quantity', $item->quantity);
            }
        }

        // Clear the cart after successful payment (for both authenticated and guest users)
        $cart = $this->cartService->getCurrentCart();
        if ($cart) {
            $cart->items()->delete();
            $cart->delete();

            // Clear session cart ID if it's a guest cart
            if ($cart->session_id) {
                $this->cartService->clearSessionId();
            }
        }

        // Dispatch low stock check for all products in the order
        foreach ($order->items as $item) {
            CheckLowStockJob::dispatch($item->product_id);
        }

        return $order->fresh(['items.product', 'items.variation', 'addresses']);
    }
}
