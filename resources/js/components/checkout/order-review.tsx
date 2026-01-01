import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Address } from '@/types/address.types';
import type { CartItem } from '@/types/cart.types';
import { Link } from '@inertiajs/react';
import { ChevronRight, ShoppingCart } from 'lucide-react';

interface OrderReviewProps {
    cartItems: CartItem[];
    shippingAddress: Address;
    billingAddress: Address;
    subtotal: number;
}

export default function OrderReview({
    cartItems,
    shippingAddress,
    billingAddress,
    subtotal,
}: OrderReviewProps) {
    const shipping = 0; // Will be calculated later
    const tax = subtotal * 0.1; // 10% tax (placeholder)
    const total = subtotal + shipping + tax;

    return (
        <Card className="p-6">
            <h2 className="mb-6 text-xl font-semibold">Order Summary</h2>

            {/* Cart Items */}
            <div className="mb-6">
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-medium">
                        Items ({cartItems.length})
                    </h3>
                    <Link
                        href="/checkout"
                        className="flex items-center text-sm text-primary hover:underline"
                    >
                        Edit
                        <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                </div>

                <div className="space-y-4">
                    {cartItems.map((item) => (
                        <div key={item.id} className="flex gap-3">
                            {/* Product Image */}
                            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
                                {item.product.primary_image_thumb_url ? (
                                    <img
                                        src={item.product.primary_image_thumb_url}
                                        alt={item.product.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                        <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                )}
                            </div>

                            {/* Product Details */}
                            <div className="flex flex-1 flex-col justify-between">
                                <div>
                                    <p className="text-sm font-medium">
                                        {item.product.name}
                                    </p>
                                    {item.variation && (
                                        <p className="text-xs text-muted-foreground">
                                            {item.variation.name}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-muted-foreground">
                                        Qty: {item.quantity}
                                    </p>
                                    <p className="text-sm font-medium">
                                        ${parseFloat(item.price).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Separator className="my-6" />

            {/* Shipping Address */}
            <div className="mb-6">
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-medium">Shipping Address</h3>
                    <Link
                        href="/checkout/shipping"
                        className="flex items-center text-sm text-primary hover:underline"
                    >
                        Edit
                        <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                </div>
                <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">
                        {shippingAddress.first_name}{' '}
                        {shippingAddress.last_name}
                    </p>
                    <p>{shippingAddress.address_line1}</p>
                    {shippingAddress.address_line2 && (
                        <p>{shippingAddress.address_line2}</p>
                    )}
                    <p>
                        {shippingAddress.city}, {shippingAddress.state}{' '}
                        {shippingAddress.postal_code}
                    </p>
                    <p>{shippingAddress.country}</p>
                    <p className="mt-1">{shippingAddress.phone}</p>
                </div>
            </div>

            <Separator className="my-6" />

            {/* Billing Address */}
            <div className="mb-6">
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-medium">Billing Address</h3>
                    <Link
                        href="/checkout/shipping"
                        className="flex items-center text-sm text-primary hover:underline"
                    >
                        Edit
                        <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                </div>
                {billingAddress.address_line1 ===
                    shippingAddress.address_line1 &&
                billingAddress.postal_code ===
                    shippingAddress.postal_code ? (
                    <p className="text-sm text-muted-foreground">
                        Same as shipping address
                    </p>
                ) : (
                    <div className="text-sm text-muted-foreground">
                        <p className="font-medium text-foreground">
                            {billingAddress.first_name}{' '}
                            {billingAddress.last_name}
                        </p>
                        <p>{billingAddress.address_line1}</p>
                        {billingAddress.address_line2 && (
                            <p>{billingAddress.address_line2}</p>
                        )}
                        <p>
                            {billingAddress.city}, {billingAddress.state}{' '}
                            {billingAddress.postal_code}
                        </p>
                        <p>{billingAddress.country}</p>
                        <p className="mt-1">{billingAddress.phone}</p>
                    </div>
                )}
            </div>

            <Separator className="my-6" />

            {/* Order Totals */}
            <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                        Subtotal ({cartItems.length} items)
                    </span>
                    <span className="font-medium">
                        ${subtotal.toFixed(2)}
                    </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-sm text-muted-foreground">
                        {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                    </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                        Estimated Tax
                    </span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                </div>

                <Separator />

                <div className="flex items-center justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                </div>
            </div>
        </Card>
    );
}
