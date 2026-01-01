<?php

declare(strict_types=1);

namespace App\Actions\Payment;

use App\Actions\Order\CreateOrderAction;
use App\Models\Order;
use App\Services\PaymentService;
use Stripe\Exception\ApiErrorException;

class CreatePaymentIntentAction
{
    public function __construct(
        protected PaymentService $paymentService,
        protected CreateOrderAction $createOrderAction
    ) {}

    /**
     * Execute the action to create a payment intent.
     *
     * @param  array{cart_id: int, user_id: int|null, shipping_address: array, billing_address: array}  $data
     * @return array{payment_intent_id: string, client_secret: string, amount: int, currency: string, order: Order}
     *
     * @throws \Exception
     * @throws ApiErrorException
     */
    public function execute(array $data): array
    {
        $order = $this->createOrderAction->execute([
            'cart_id' => $data['cart_id'],
            'user_id' => $data['user_id'] ?? null,
            'shipping_address' => $data['shipping_address'],
            'billing_address' => $data['billing_address'],
            'stripe_payment_intent_id' => null,
        ]);

        $paymentIntent = $this->paymentService->createPaymentIntent($order);

        $order->update([
            'stripe_payment_intent_id' => $paymentIntent->id,
        ]);

        return [
            'payment_intent_id' => $paymentIntent->id,
            'client_secret' => $paymentIntent->client_secret,
            'amount' => $paymentIntent->amount,
            'currency' => $paymentIntent->currency,
            'order' => $order->fresh(),
        ];
    }
}
