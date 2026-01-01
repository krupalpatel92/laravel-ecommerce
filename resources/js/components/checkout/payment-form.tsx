import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePayment } from '@/hooks/use-payment';
import type { Address } from '@/types/address.types';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import type { StripeCardElementChangeEvent } from '@stripe/stripe-js';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface PaymentFormProps {
    cartId: number;
    shippingAddress: Address;
    billingAddress: Address;
    total: number;
    onSuccess: (orderNumber: string) => void;
}

const CARD_ELEMENT_OPTIONS = {
    style: {
        base: {
            fontSize: '16px',
            color: '#1f2937',
            fontFamily:
                'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            '::placeholder': {
                color: '#9ca3af',
            },
        },
        invalid: {
            color: '#ef4444',
            iconColor: '#ef4444',
        },
    },
};

export default function PaymentForm({
    cartId,
    shippingAddress,
    billingAddress,
    total,
    onSuccess,
}: PaymentFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const { createPaymentIntent, confirmPayment, error, clearError } =
        usePayment();

    const [cardholderName, setCardholderName] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [cardComplete, setCardComplete] = useState(false);
    const [cardError, setCardError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCardChange = (event: StripeCardElementChangeEvent) => {
        setCardComplete(event.complete);
        setCardError(event.error ? event.error.message : null);
        if (event.error) {
            clearError();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        if (!termsAccepted) {
            setCardError('Please accept the terms and conditions');
            return;
        }

        if (!cardComplete) {
            setCardError('Please complete your card details');
            return;
        }

        setIsSubmitting(true);
        setCardError(null);
        clearError();

        try {
            // Step 1: Create payment intent on backend
            const paymentIntentData = await createPaymentIntent(
                cartId,
                shippingAddress,
                billingAddress,
            );

            if (!paymentIntentData) {
                setIsSubmitting(false);
                return;
            }

            const cardElement = elements.getElement(CardElement);

            if (!cardElement) {
                setCardError('Card element not found');
                setIsSubmitting(false);
                return;
            }

            // Step 2: Confirm payment with Stripe
            const { error: stripeError, paymentIntent } =
                await stripe.confirmCardPayment(
                    paymentIntentData.client_secret,
                    {
                        payment_method: {
                            card: cardElement,
                            billing_details: {
                                name:
                                    cardholderName ||
                                    `${billingAddress.first_name} ${billingAddress.last_name}`,
                                address: {
                                    line1: billingAddress.address_line1,
                                    line2: billingAddress.address_line2 || undefined,
                                    city: billingAddress.city,
                                    state: billingAddress.state,
                                    postal_code: billingAddress.postal_code,
                                    country: billingAddress.country,
                                },
                                phone: billingAddress.phone,
                            },
                        },
                    },
                );

            if (stripeError) {
                setCardError(
                    stripeError.message ||
                        'Payment failed. Please try again.',
                );
                setIsSubmitting(false);
                return;
            }

            if (paymentIntent.status === 'succeeded') {
                // Step 3: Confirm payment on backend
                const confirmData = await confirmPayment(
                    paymentIntentData.order.id,
                    paymentIntent.id,
                );

                if (confirmData) {
                    // Success! Redirect to confirmation page
                    onSuccess(confirmData.order.order_number);
                } else {
                    setIsSubmitting(false);
                }
            } else {
                setCardError('Payment could not be processed. Please try again.');
                setIsSubmitting(false);
            }
        } catch (err) {
            setCardError(
                'An unexpected error occurred. Please try again.',
            );
            setIsSubmitting(false);
        }
    };

    const isFormValid = stripe && cardComplete && termsAccepted && !isSubmitting;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Display */}
            {(error || cardError) && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {error || cardError}
                    </AlertDescription>
                </Alert>
            )}

            {/* Cardholder Name */}
            <div className="space-y-2">
                <Label htmlFor="cardholderName">
                    Cardholder Name (Optional)
                </Label>
                <Input
                    id="cardholderName"
                    type="text"
                    placeholder="Name on card"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    disabled={isSubmitting}
                />
            </div>

            {/* Stripe Card Element */}
            <div className="space-y-2">
                <Label htmlFor="card-element">Card Details</Label>
                <div
                    id="card-element"
                    className="rounded-md border border-input bg-background px-3 py-3 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                >
                    <CardElement
                        options={CARD_ELEMENT_OPTIONS}
                        onChange={handleCardChange}
                    />
                </div>
                <p className="text-xs text-muted-foreground">
                    Test card: 4242 4242 4242 4242
                </p>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-2">
                <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) =>
                        setTermsAccepted(checked === true)
                    }
                    disabled={isSubmitting}
                />
                <div className="grid gap-1.5 leading-none">
                    <Label
                        htmlFor="terms"
                        className="text-sm font-normal leading-relaxed"
                    >
                        I agree to the{' '}
                        <a
                            href="/terms"
                            target="_blank"
                            className="text-primary underline"
                        >
                            terms and conditions
                        </a>
                    </Label>
                </div>
            </div>

            {/* Submit Button */}
            <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={!isFormValid}
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing Payment...
                    </>
                ) : (
                    <>Place Order - ${total.toFixed(2)}</>
                )}
            </Button>

            {/* Security Note */}
            <p className="text-center text-xs text-muted-foreground">
                Your payment information is encrypted and secure
            </p>
        </form>
    );
}
