<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Order;
use Stripe\Exception\ApiErrorException;
use Stripe\PaymentIntent;
use Stripe\Refund;
use Stripe\StripeClient;

class PaymentService
{
    protected StripeClient $stripe;

    public function __construct()
    {
        $this->stripe = new StripeClient(config('cashier.secret'));
    }

    /**
     * Create a Stripe Payment Intent for an order.
     *
     * @throws ApiErrorException
     */
    public function createPaymentIntent(Order $order, array $metadata = []): PaymentIntent
    {
        $amount = (int) round($order->total * 100);

        $defaultMetadata = [
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'user_id' => $order->user_id ?? 'guest',
        ];

        return $this->stripe->paymentIntents->create([
            'amount' => $amount,
            'currency' => config('cashier.currency', 'usd'),
            'metadata' => array_merge($defaultMetadata, $metadata),
            'automatic_payment_methods' => [
                'enabled' => true,
            ],
        ]);
    }

    /**
     * Retrieve and confirm a payment intent.
     *
     * @throws ApiErrorException
     */
    public function confirmPayment(string $paymentIntentId): PaymentIntent
    {
        return $this->stripe->paymentIntents->retrieve($paymentIntentId);
    }

    /**
     * Cancel a payment intent.
     *
     * @throws ApiErrorException
     */
    public function cancelPaymentIntent(string $paymentIntentId): PaymentIntent
    {
        return $this->stripe->paymentIntents->cancel($paymentIntentId);
    }

    /**
     * Handle successful payment.
     */
    public function handlePaymentSuccess(Order $order, string $paymentIntentId): void
    {
        $order->update([
            'payment_status' => 'paid',
            'status' => 'processing',
            'stripe_payment_intent_id' => $paymentIntentId,
        ]);
    }

    /**
     * Handle failed payment.
     */
    public function handlePaymentFailure(Order $order, string $paymentIntentId): void
    {
        $order->update([
            'payment_status' => 'failed',
            'stripe_payment_intent_id' => $paymentIntentId,
        ]);
    }

    /**
     * Refund a payment (full or partial).
     *
     * @param  int|null  $amount  Amount in cents (null for full refund)
     *
     * @throws ApiErrorException
     */
    public function refundPayment(Order $order, ?int $amount = null): Refund
    {
        if (! $order->stripe_payment_intent_id) {
            throw new \Exception('Order does not have a payment intent ID.');
        }

        $refundData = [
            'payment_intent' => $order->stripe_payment_intent_id,
        ];

        if ($amount !== null) {
            $refundData['amount'] = $amount;
        }

        $refund = $this->stripe->refunds->create($refundData);

        $order->update([
            'payment_status' => 'refunded',
        ]);

        return $refund;
    }
}
