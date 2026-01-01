import CheckoutSteps from '@/components/checkout/checkout-steps';
import OrderReview from '@/components/checkout/order-review';
import PaymentForm from '@/components/checkout/payment-form';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCart } from '@/hooks/use-cart';
import AppLayout from '@/layouts/app-layout';
import type { Address, CheckoutAddresses } from '@/types/address.types';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

// Initialize Stripe
const stripePromise = loadStripe(
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
);

export default function CheckoutPayment() {
    const { cart } = useCart();
    const [shippingAddress, setShippingAddress] = useState<Address | null>(
        null,
    );
    const [billingAddress, setBillingAddress] = useState<Address | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const items = cart?.items || [];
    const itemCount = cart?.item_count || 0;
    const subtotal = cart?.total || 0;
    const tax = subtotal * 0.1; // 10% tax (placeholder)
    const total = subtotal + tax;

    // Load addresses from session storage
    useEffect(() => {
        const checkoutData = sessionStorage.getItem('checkoutData');
        if (checkoutData) {
            try {
                const data: CheckoutAddresses = JSON.parse(checkoutData);
                setShippingAddress(data.shipping);
                setBillingAddress(data.billing);
            } catch (error) {
                console.error('Failed to parse checkout data:', error);
            }
        }
        setIsLoading(false);
    }, []);

    // Navigation guards - only run after loading is complete
    useEffect(() => {
        if (isLoading) return;

        // Redirect if no cart items
        if (itemCount === 0) {
            router.visit('/cart');
            toast.error('Your cart is empty');
            return;
        }

        // Redirect if no addresses
        if (!shippingAddress || !billingAddress) {
            router.visit('/checkout/shipping');
            toast.error('Please provide shipping and billing addresses');
            return;
        }
    }, [itemCount, shippingAddress, billingAddress, isLoading]);

    // Handle payment success
    const handlePaymentSuccess = (orderNumber: string) => {
        router.visit(`/checkout/confirmation/${orderNumber}`);
    };

    // Don't render until we have addresses
    if (
        itemCount === 0 ||
        !shippingAddress ||
        !billingAddress ||
        !cart
    ) {
        return null;
    }

    return (
        <AppLayout>
            <Head title="Checkout - Payment" />

            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

                <CheckoutSteps currentStep={3} />

                <div className="mt-8 grid gap-8 lg:grid-cols-3">
                    {/* Left Column: Payment Form */}
                    <div className="lg:col-span-2">
                        <Card className="p-6">
                            <h2 className="mb-6 text-xl font-semibold">
                                Payment Information
                            </h2>

                            <Elements stripe={stripePromise}>
                                <PaymentForm
                                    cartId={cart.id}
                                    shippingAddress={shippingAddress}
                                    billingAddress={billingAddress}
                                    total={total}
                                    onSuccess={handlePaymentSuccess}
                                />
                            </Elements>
                        </Card>

                        {/* Back Button */}
                        <div className="mt-6">
                            <Button variant="ghost" asChild>
                                <Link href="/checkout/shipping">
                                    ← Back to Shipping
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Right Column: Order Review (Sticky) */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-4">
                            <OrderReview
                                cartItems={items}
                                shippingAddress={shippingAddress}
                                billingAddress={billingAddress}
                                subtotal={subtotal}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
