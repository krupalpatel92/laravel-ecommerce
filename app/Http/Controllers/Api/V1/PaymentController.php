<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Actions\Payment\ConfirmPaymentAction;
use App\Actions\Payment\CreatePaymentIntentAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\ConfirmPaymentRequest;
use App\Http\Requests\CreatePaymentIntentRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    /**
     * Create a payment intent for checkout.
     */
    public function createIntent(
        CreatePaymentIntentRequest $request,
        CreatePaymentIntentAction $action
    ): JsonResponse {
        try {
            $result = $action->execute([
                'cart_id' => $request->input('cart_id'),
                'user_id' => $request->user()?->id,
                'shipping_address' => $request->input('shipping_address'),
                'billing_address' => $request->input('billing_address'),
            ]);

            return response()->json([
                'data' => [
                    'payment_intent_id' => $result['payment_intent_id'],
                    'client_secret' => $result['client_secret'],
                    'amount' => $result['amount'],
                    'currency' => $result['currency'],
                    'order' => [
                        'id' => $result['order']->id,
                        'order_number' => $result['order']->order_number,
                        'total' => $result['order']->total,
                        'status' => $result['order']->status,
                        'payment_status' => $result['order']->payment_status,
                    ],
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Payment intent creation failed', [
                'error' => $e->getMessage(),
                'cart_id' => $request->input('cart_id'),
            ]);

            return response()->json([
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Confirm payment success.
     */
    public function confirmPayment(
        ConfirmPaymentRequest $request,
        ConfirmPaymentAction $action
    ): JsonResponse {
        try {
            $order = $action->execute([
                'order_id' => $request->input('order_id'),
                'payment_intent_id' => $request->input('payment_intent_id'),
            ]);

            return response()->json([
                'data' => [
                    'success' => true,
                    'order' => [
                        'id' => $order->id,
                        'order_number' => $order->order_number,
                        'status' => $order->status,
                        'payment_status' => $order->payment_status,
                        'total' => $order->total,
                        'items' => $order->items->map(fn ($item) => [
                            'product_id' => $item->product_id,
                            'product_name' => $item->getProductName(),
                            'variation_name' => $item->getVariationName(),
                            'quantity' => $item->quantity,
                            'price' => $item->price,
                            'subtotal' => $item->getSubtotal(),
                        ]),
                        'shipping_address' => $order->getShippingAddress(),
                        'billing_address' => $order->getBillingAddress(),
                    ],
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Payment confirmation failed', [
                'error' => $e->getMessage(),
                'order_id' => $request->input('order_id'),
                'payment_intent_id' => $request->input('payment_intent_id'),
            ]);

            return response()->json([
                'error' => $e->getMessage(),
            ], 400);
        }
    }
}
