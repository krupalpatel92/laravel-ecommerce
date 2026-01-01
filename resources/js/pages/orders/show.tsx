import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    OrderStatusBadge,
    PaymentStatusBadge,
} from '@/components/orders/order-status-badge';
import AppLayout from '@/layouts/app-layout';
import { Order } from '@/types/order.types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Package,
    MapPin,
    CreditCard,
    ShoppingCart,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useCart } from '@/hooks/use-cart';

interface OrderShowProps {
    order: Order;
}

export default function OrderShow({ order }: OrderShowProps) {
    const { addToCart } = useCart();
    const [isReordering, setIsReordering] = useState(false);

    const shippingAddress = order.addresses?.find(
        (addr) => addr.type === 'shipping',
    );
    const billingAddress = order.addresses?.find(
        (addr) => addr.type === 'billing',
    );

    const formatCurrency = (amount: number | string) => {
        const numAmount =
            typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(numAmount);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handleReorder = async () => {
        if (!order.items || order.items.length === 0) {
            toast.error('No items to reorder');
            return;
        }

        setIsReordering(true);

        try {
            // Add all items to cart
            for (const item of order.items) {
                await addToCart(
                    item.product_id,
                    item.variation_id || undefined,
                    item.quantity,
                );
            }

            toast.success('Items added to cart successfully');
            router.visit('/cart');
        } catch (error) {
            console.error('Failed to reorder:', error);
            toast.error('Failed to add items to cart. Please try again.');
        } finally {
            setIsReordering(false);
        }
    };

    const subtotal = parseFloat(order.total);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    return (
        <AppLayout>
            <Head title={`Order ${order.order_number}`} />

            <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Back Button */}
                <div className="mb-6">
                    <Button variant="ghost" asChild>
                        <Link href="/orders">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Orders
                        </Link>
                    </Button>
                </div>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="mb-2 text-3xl font-bold">
                        Order #{order.order_number}
                    </h1>
                    <p className="text-muted-foreground">
                        Placed on {formatDate(order.created_at)}
                    </p>
                </div>

                {/* Status Card */}
                <Card className="mb-6 p-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <div>
                            <p className="mb-2 text-sm font-medium text-muted-foreground">
                                Order Status
                            </p>
                            <OrderStatusBadge status={order.status} />
                        </div>
                        <Separator
                            orientation="vertical"
                            className="hidden h-12 sm:block"
                        />
                        <div>
                            <p className="mb-2 text-sm font-medium text-muted-foreground">
                                Payment Status
                            </p>
                            <PaymentStatusBadge
                                status={order.payment_status}
                            />
                        </div>
                    </div>
                </Card>

                {/* Order Items */}
                <Card className="mb-6 p-6">
                    <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                        <Package className="h-5 w-5" />
                        Order Items
                    </h2>
                    <div className="space-y-4">
                        {order.items?.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center gap-4"
                            >
                                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
                                    {item.product?.primary_image_url ? (
                                        <img
                                            src={item.product.primary_image_url}
                                            alt={item.product.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <Package className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium">
                                        {item.product?.name}
                                    </h3>
                                    {item.variation && (
                                        <p className="text-sm text-muted-foreground">
                                            {item.variation.name}
                                        </p>
                                    )}
                                    <p className="text-sm text-muted-foreground">
                                        Quantity: {item.quantity}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">
                                        {formatCurrency(item.price)}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        each
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                                Subtotal
                            </span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                                Tax (10%)
                            </span>
                            <span>{formatCurrency(tax)}</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between text-lg font-bold">
                            <span>Total</span>
                            <span>{formatCurrency(total)}</span>
                        </div>
                    </div>
                </Card>

                {/* Addresses */}
                <div className="mb-6 grid gap-6 sm:grid-cols-2">
                    {/* Shipping Address */}
                    {shippingAddress && (
                        <Card className="p-6">
                            <h3 className="mb-3 flex items-center gap-2 font-semibold">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                Shipping Address
                            </h3>
                            <div className="space-y-1 text-sm text-muted-foreground">
                                <p className="font-medium text-foreground">
                                    {shippingAddress.first_name}{' '}
                                    {shippingAddress.last_name}
                                </p>
                                <p>{shippingAddress.address_line1}</p>
                                {shippingAddress.address_line2 && (
                                    <p>{shippingAddress.address_line2}</p>
                                )}
                                <p>
                                    {shippingAddress.city},{' '}
                                    {shippingAddress.state}{' '}
                                    {shippingAddress.postal_code}
                                </p>
                                <p>{shippingAddress.country}</p>
                                <p>{shippingAddress.phone}</p>
                            </div>
                        </Card>
                    )}

                    {/* Billing Address */}
                    {billingAddress && (
                        <Card className="p-6">
                            <h3 className="mb-3 flex items-center gap-2 font-semibold">
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                Billing Address
                            </h3>
                            <div className="space-y-1 text-sm text-muted-foreground">
                                <p className="font-medium text-foreground">
                                    {billingAddress.first_name}{' '}
                                    {billingAddress.last_name}
                                </p>
                                <p>{billingAddress.address_line1}</p>
                                {billingAddress.address_line2 && (
                                    <p>{billingAddress.address_line2}</p>
                                )}
                                <p>
                                    {billingAddress.city},{' '}
                                    {billingAddress.state}{' '}
                                    {billingAddress.postal_code}
                                </p>
                                <p>{billingAddress.country}</p>
                                <p>{billingAddress.phone}</p>
                            </div>
                        </Card>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                        onClick={handleReorder}
                        disabled={isReordering}
                        size="lg"
                        className="flex-1"
                    >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        {isReordering ? 'Adding to Cart...' : 'Reorder Items'}
                    </Button>
                    <Button variant="outline" asChild size="lg">
                        <Link href="/orders">View All Orders</Link>
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
