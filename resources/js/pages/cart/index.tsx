import CartExpiryTimer from '@/components/cart/cart-expiry-timer';
import CartItem from '@/components/cart/cart-item';
import CartSummary from '@/components/cart/cart-summary';
import EmptyCart from '@/components/cart/empty-cart';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/use-cart';
import AppLayout from '@/layouts/app-layout';
import { router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

export default function CartIndex() {
    const { cart, loading } = useCart();

    const handleCheckout = () => {
        router.visit('/checkout');
    };

    const handleContinueShopping = () => {
        router.visit('/products');
    };

    if (loading) {
        return (
            <AppLayout
                breadcrumbs={[
                    { label: 'Home', href: '/' },
                    { label: 'Shopping Cart' },
                ]}
            >
                <div className="container mx-auto px-4 py-8">
                    <div className="mb-8">
                        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
                    </div>
                    <div className="grid gap-8 lg:grid-cols-3">
                        <div className="space-y-4 lg:col-span-2">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="h-32 animate-pulse rounded-lg bg-muted"
                                />
                            ))}
                        </div>
                        <div className="h-64 animate-pulse rounded-lg bg-muted" />
                    </div>
                </div>
            </AppLayout>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <AppLayout
                breadcrumbs={[
                    { label: 'Home', href: '/' },
                    { label: 'Shopping Cart' },
                ]}
            >
                <div className="container mx-auto px-4 py-8">
                    <h1 className="mb-8 text-3xl font-bold">Shopping Cart</h1>
                    <EmptyCart />
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout
            breadcrumbs={[
                { label: 'Home', href: '/' },
                { label: 'Shopping Cart' },
            ]}
        >
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Shopping Cart</h1>
                    <p className="mt-2 text-muted-foreground">
                        {cart.item_count}{' '}
                        {cart.item_count === 1 ? 'item' : 'items'} in your cart
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        {cart.expires_at && !cart.user_id && (
                            <CartExpiryTimer expiresAt={cart.expires_at} />
                        )}

                        <div className="rounded-lg border bg-card">
                            <div className="divide-y">
                                {cart.items.map((item) => (
                                    <div key={item.id} className="p-6">
                                        <CartItem item={item} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            onClick={handleContinueShopping}
                            className="w-full sm:w-auto"
                        >
                            <ArrowLeft className="mr-2 size-4" />
                            Continue Shopping
                        </Button>
                    </div>

                    <div className="lg:sticky lg:top-4 lg:self-start">
                        <div className="rounded-lg border bg-card p-6">
                            <h2 className="mb-4 text-lg font-semibold">
                                Order Summary
                            </h2>
                            <CartSummary onCheckout={handleCheckout} />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
