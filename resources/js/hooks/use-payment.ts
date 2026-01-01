import { useCart } from '@/hooks/use-cart';
import { apiClient } from '@/lib/api';
import type { Address } from '@/types/address.types';
import { router } from '@inertiajs/react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

interface PaymentIntentResponse {
    payment_intent_id: string;
    client_secret: string;
    amount: number;
    currency: string;
    order: {
        id: number;
        order_number: string;
        total: string;
        status: string;
    };
}

interface ConfirmPaymentResponse {
    success: boolean;
    order: {
        id: number;
        order_number: string;
        status: string;
        payment_status: string;
        total: string;
    };
}

interface UsePaymentReturn {
    isProcessing: boolean;
    error: string | null;
    createPaymentIntent: (
        cartId: number,
        shippingAddress: Address,
        billingAddress: Address,
    ) => Promise<PaymentIntentResponse | null>;
    confirmPayment: (
        orderId: number,
        paymentIntentId: string,
    ) => Promise<ConfirmPaymentResponse | null>;
    clearError: () => void;
}

export function usePayment(): UsePaymentReturn {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { clearCart } = useCart();

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const createPaymentIntent = useCallback(
        async (
            cartId: number,
            shippingAddress: Address,
            billingAddress: Address,
        ): Promise<PaymentIntentResponse | null> => {
            setIsProcessing(true);
            setError(null);

            try {
                const response = await apiClient.post('/checkout/payment-intent', {
                    cart_id: cartId,
                    shipping_address: shippingAddress,
                    billing_address: billingAddress,
                });

                return response.data.data;
            } catch (err: any) {
                const message = err.response?.data?.message || 'Failed to create payment intent';
                setError(message);
                toast.error(message);
                return null;
            } finally {
                setIsProcessing(false);
            }
        },
        [],
    );

    const confirmPayment = useCallback(
        async (
            orderId: number,
            paymentIntentId: string,
        ): Promise<ConfirmPaymentResponse | null> => {
            setIsProcessing(true);
            setError(null);

            try {
                const response = await apiClient.post('/checkout/confirm-payment', {
                    order_id: orderId,
                    payment_intent_id: paymentIntentId,
                });

                // Clear checkout data from session storage
                sessionStorage.removeItem('checkoutData');

                toast.success('Payment successful!');

                // Note: Cart is already cleared on backend during confirmPayment
                // Clear cart state on frontend silently (don't make API call)
                clearCart(true);

                return response.data.data;
            } catch (err: any) {
                const message = err.response?.data?.message || 'Failed to confirm payment';
                setError(message);
                toast.error(message);
                return null;
            } finally {
                setIsProcessing(false);
            }
        },
        [clearCart],
    );

    return {
        isProcessing,
        error,
        createPaymentIntent,
        confirmPayment,
        clearError,
    };
}
