<?php

declare(strict_types=1);

namespace App\Actions\Payment;

use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class HandlePaymentWebhookAction
{
    /**
     * Execute the action to handle webhook events.
     *
     * @param  array{type: string, data: array}  $event
     */
    public function execute(array $event): void
    {
        $type = $event['type'];
        $data = $event['data']['object'] ?? [];

        Log::info('Stripe webhook received', [
            'type' => $type,
            'payment_intent_id' => $data['id'] ?? null,
        ]);

        match ($type) {
            'payment_intent.succeeded' => $this->handlePaymentIntentSucceeded($data),
            'payment_intent.payment_failed' => $this->handlePaymentIntentFailed($data),
            'payment_intent.canceled' => $this->handlePaymentIntentCanceled($data),
            'charge.refunded' => $this->handleChargeRefunded($data),
            default => Log::info('Unhandled webhook event', ['type' => $type]),
        };
    }

    /**
     * Handle payment_intent.succeeded event.
     */
    protected function handlePaymentIntentSucceeded(array $data): void
    {
        $paymentIntentId = $data['id'] ?? null;

        if (! $paymentIntentId) {
            Log::error('Payment intent ID missing from webhook data');

            return;
        }

        DB::transaction(function () use ($paymentIntentId) {
            $order = Order::where('stripe_payment_intent_id', $paymentIntentId)->first();

            if (! $order) {
                Log::warning('Order not found for payment intent', [
                    'payment_intent_id' => $paymentIntentId,
                ]);

                return;
            }

            if ($order->payment_status === 'paid') {
                Log::info('Order already marked as paid', ['order_id' => $order->id]);

                return;
            }

            $order->update([
                'payment_status' => 'paid',
                'status' => 'processing',
            ]);

            Log::info('Order payment confirmed via webhook', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
            ]);
        });
    }

    /**
     * Handle payment_intent.payment_failed event.
     */
    protected function handlePaymentIntentFailed(array $data): void
    {
        $paymentIntentId = $data['id'] ?? null;

        if (! $paymentIntentId) {
            Log::error('Payment intent ID missing from webhook data');

            return;
        }

        $order = Order::where('stripe_payment_intent_id', $paymentIntentId)->first();

        if (! $order) {
            Log::warning('Order not found for payment intent', [
                'payment_intent_id' => $paymentIntentId,
            ]);

            return;
        }

        $order->update([
            'payment_status' => 'failed',
        ]);

        Log::info('Order payment failed', [
            'order_id' => $order->id,
            'order_number' => $order->order_number,
        ]);
    }

    /**
     * Handle payment_intent.canceled event.
     */
    protected function handlePaymentIntentCanceled(array $data): void
    {
        $paymentIntentId = $data['id'] ?? null;

        if (! $paymentIntentId) {
            Log::error('Payment intent ID missing from webhook data');

            return;
        }

        $order = Order::where('stripe_payment_intent_id', $paymentIntentId)->first();

        if (! $order) {
            Log::warning('Order not found for payment intent', [
                'payment_intent_id' => $paymentIntentId,
            ]);

            return;
        }

        if ($order->status !== 'cancelled') {
            $order->update([
                'status' => 'cancelled',
            ]);

            Log::info('Order cancelled via webhook', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
            ]);
        }
    }

    /**
     * Handle charge.refunded event.
     */
    protected function handleChargeRefunded(array $data): void
    {
        $paymentIntentId = $data['payment_intent'] ?? null;

        if (! $paymentIntentId) {
            Log::error('Payment intent ID missing from charge refund webhook data');

            return;
        }

        DB::transaction(function () use ($paymentIntentId) {
            $order = Order::where('stripe_payment_intent_id', $paymentIntentId)->first();

            if (! $order) {
                Log::warning('Order not found for payment intent', [
                    'payment_intent_id' => $paymentIntentId,
                ]);

                return;
            }

            $order->update([
                'payment_status' => 'refunded',
                'status' => 'cancelled',
            ]);

            Log::info('Order refunded via webhook', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
            ]);
        });
    }
}
