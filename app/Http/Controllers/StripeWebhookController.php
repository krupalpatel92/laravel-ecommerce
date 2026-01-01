<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Payment\HandlePaymentWebhookAction;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Laravel\Cashier\Http\Controllers\WebhookController as CashierWebhookController;

class StripeWebhookController extends CashierWebhookController
{
    /**
     * Handle a Stripe webhook call.
     */
    public function handleWebhook(Request $request): Response
    {
        $payload = json_decode($request->getContent(), true);

        try {
            $action = app(HandlePaymentWebhookAction::class);
            $action->execute($payload);
        } catch (\Exception $e) {
            Log::error('Webhook processing error', [
                'error' => $e->getMessage(),
                'event_type' => $payload['type'] ?? 'unknown',
            ]);
        }

        return response()->noContent();
    }

    /**
     * Handle payment intent succeeded.
     */
    protected function handlePaymentIntentSucceeded(array $payload): void
    {
        $action = app(HandlePaymentWebhookAction::class);
        $action->execute($payload);
    }

    /**
     * Handle payment intent payment failed.
     */
    protected function handlePaymentIntentPaymentFailed(array $payload): void
    {
        $action = app(HandlePaymentWebhookAction::class);
        $action->execute($payload);
    }

    /**
     * Handle charge refunded.
     */
    protected function handleChargeRefunded(array $payload): void
    {
        $action = app(HandlePaymentWebhookAction::class);
        $action->execute($payload);
    }
}
