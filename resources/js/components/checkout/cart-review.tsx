import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/use-cart';
import { Link, router } from '@inertiajs/react';
import { Loader2, ShoppingCart, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import QuantitySelector from './quantity-selector';

export default function CartReview() {
    const { cart, loading, updateQuantity, removeItem } = useCart();
    const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);

    const items = cart?.items || [];
    const itemCount = cart?.item_count || 0;
    const subtotal = cart?.total || 0;

    const handleQuantityChange = async (itemId: number, newQuantity: number) => {
        setUpdatingItemId(itemId);
        try {
            await updateQuantity(itemId, newQuantity);
        } finally {
            setUpdatingItemId(null);
        }
    };

    const handleRemoveItem = async (itemId: number) => {
        setUpdatingItemId(itemId);
        try {
            await removeItem(itemId);
        } finally {
            setUpdatingItemId(null);
        }
    };

    const handleContinueToShipping = () => {
        router.visit('/checkout/shipping');
    };

    if (itemCount === 0) {
        return (
            <Card className="p-12 text-center">
                <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground" />
                <h2 className="mt-4 text-xl font-semibold">Your cart is empty</h2>
                <p className="mt-2 text-muted-foreground">
                    Add some products to get started
                </p>
                <Button asChild className="mt-6">
                    <Link href="/products">Continue Shopping</Link>
                </Button>
            </Card>
        );
    }

    const shipping = 0; // Free shipping
    const tax = subtotal * 0.1; // 10% tax (placeholder)
    const total = subtotal + shipping + tax;

    return (
        <div className="grid gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2">
                <Card className="p-6">
                    <h2 className="mb-6 text-xl font-semibold">Cart Items</h2>

                    <div className="space-y-6">
                        {items.map((item) => (
                            <div key={item.id}>
                                <div className="flex gap-4">
                                    {/* Product Image */}
                                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border bg-muted">
                                        {item.product.primary_image_thumb_url ? (
                                            <img
                                                src={item.product.primary_image_thumb_url}
                                                alt={item.product.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Details */}
                                    <div className="flex flex-1 flex-col justify-between">
                                        <div>
                                            <Link
                                                href={`/products/${item.product.slug}`}
                                                className="font-medium hover:underline"
                                            >
                                                {item.product.name}
                                            </Link>
                                            {item.variation && (
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {item.variation.name}
                                                </p>
                                            )}
                                            <p className="mt-1 text-sm font-medium">
                                                ${parseFloat(item.price).toFixed(2)}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            {updatingItemId === item.id ? (
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    <span>Updating...</span>
                                                </div>
                                            ) : (
                                                <QuantitySelector
                                                    value={item.quantity}
                                                    onChange={(newQuantity) =>
                                                        handleQuantityChange(
                                                            item.id,
                                                            newQuantity,
                                                        )
                                                    }
                                                    disabled={
                                                        updatingItemId !== null
                                                    }
                                                />
                                            )}
                                        </div>
                                    </div>

                                    {/* Price and Remove */}
                                    <div className="flex flex-col items-end justify-between">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveItem(item.id)}
                                            disabled={updatingItemId !== null}
                                            className="h-8 w-8 p-0"
                                        >
                                            <X className="h-4 w-4" />
                                            <span className="sr-only">Remove item</span>
                                        </Button>

                                        <p className="font-semibold">
                                            $
                                            {parseFloat(item.subtotal).toFixed(2)}
                                        </p>
                                    </div>
                                </div>

                                <Separator className="mt-6" />
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
                <Card className="p-6 lg:sticky lg:top-8">
                    <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>

                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                                Subtotal ({itemCount} items)
                            </span>
                            <span className="font-medium">
                                ${subtotal.toFixed(2)}
                            </span>
                        </div>

                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Shipping</span>
                            <span className="font-medium text-green-600">
                                Free
                            </span>
                        </div>

                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                                Estimated Tax
                            </span>
                            <span className="font-medium">
                                ${tax.toFixed(2)}
                            </span>
                        </div>

                        <Separator />

                        <div className="flex justify-between">
                            <span className="text-lg font-semibold">Total</span>
                            <span className="text-lg font-bold">
                                ${total.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    <Button
                        className="mt-6 w-full"
                        size="lg"
                        onClick={handleContinueToShipping}
                        disabled={loading || updatingItemId !== null}
                    >
                        Continue to Shipping
                    </Button>

                    <Button
                        asChild
                        variant="ghost"
                        className="mt-2 w-full"
                        disabled={loading || updatingItemId !== null}
                    >
                        <Link href="/cart">Back to Cart</Link>
                    </Button>
                </Card>
            </div>
        </div>
    );
}
