import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { useCart } from '@/hooks/use-cart';
import { Link, router, usePage } from '@inertiajs/react';
import { Info, ShoppingBag } from 'lucide-react';
import { type ReactNode } from 'react';
import CartExpiryTimer from './cart-expiry-timer';
import CartItem from './cart-item';
import CartSummary from './cart-summary';
import EmptyCart from './empty-cart';

interface CartDrawerProps {
    children?: ReactNode;
}

export default function CartDrawer({ children }: CartDrawerProps) {
    const { cart, isDrawerOpen, closeDrawer, openDrawer } = useCart();
    const { auth } = usePage().props as any;
    const isAuthenticated = !!auth?.user;

    const handleCheckout = () => {
        closeDrawer();
        router.visit('/checkout');
    };

    const handleViewCart = () => {
        closeDrawer();
        router.visit('/cart');
    };

    return (
        <Sheet open={isDrawerOpen} onOpenChange={closeDrawer}>
            {children && <SheetTrigger asChild>{children}</SheetTrigger>}
            <SheetContent className="flex w-full flex-col p-0 sm:max-w-lg">
                <SheetHeader className="px-6">
                    <SheetTitle>Shopping Cart</SheetTitle>
                </SheetHeader>

                {!cart || cart.items.length === 0 ? (
                    <div className="px-6">
                        <EmptyCart />
                    </div>
                ) : (
                    <>
                        {cart.expires_at && !cart.user_id && (
                            <div className="mb-4 px-6">
                                <CartExpiryTimer expiresAt={cart.expires_at} />
                            </div>
                        )}

                        <ScrollArea className="flex-1">
                            <div className="space-y-4 px-6">
                                {cart.items.map((item) => (
                                    <div key={item.id}>
                                        <CartItem item={item} />
                                        <Separator className="mt-4" />
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        <div className="space-y-3 px-6 pb-6">
                            <CartSummary
                                onCheckout={handleCheckout}
                                showCheckoutButton={false}
                            />

                            {!isAuthenticated && (
                                <Alert>
                                    <Info className="h-4 w-4" />
                                    <AlertDescription>
                                        Please sign in or create an account to
                                        complete your order.
                                    </AlertDescription>
                                </Alert>
                            )}

                            {isAuthenticated ? (
                                <Button
                                    onClick={handleCheckout}
                                    className="w-full"
                                    size="lg"
                                >
                                    Proceed to Checkout
                                </Button>
                            ) : (
                                <div className="space-y-2">
                                    <Button
                                        asChild
                                        className="w-full"
                                        size="lg"
                                    >
                                        <Link href="/login">
                                            Sign In to Checkout
                                        </Link>
                                    </Button>
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="w-full"
                                    >
                                        <Link href="/register">
                                            Create Account
                                        </Link>
                                    </Button>
                                </div>
                            )}

                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={handleViewCart}
                            >
                                <ShoppingBag className="mr-2 size-4" />
                                View Full Cart
                            </Button>

                            <Button
                                variant="ghost"
                                className="w-full"
                                onClick={closeDrawer}
                            >
                                Continue Shopping
                            </Button>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
