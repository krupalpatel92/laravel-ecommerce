import CartReview from '@/components/checkout/cart-review';
import CheckoutSteps from '@/components/checkout/checkout-steps';
import { useCart } from '@/hooks/use-cart';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useEffect } from 'react';

export default function CheckoutIndex() {
    const { cart } = useCart();
    const itemCount = cart?.item_count || 0;

    useEffect(() => {
        if (itemCount === 0) {
            router.visit('/cart');
        }
    }, [itemCount]);

    if (itemCount === 0) {
        return null;
    }

    return (
        <AppLayout>
            <Head title="Checkout - Review Cart" />

            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

                <CheckoutSteps currentStep={1} />

                <div className="mt-8">
                    <CartReview />
                </div>
            </div>
        </AppLayout>
    );
}
