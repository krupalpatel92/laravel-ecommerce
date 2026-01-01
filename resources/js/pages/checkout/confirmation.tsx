import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { Order } from '@/types/order.types';
import { Head, Link, router } from '@inertiajs/react';
import { CheckCircle2, Package, MapPin, CreditCard } from 'lucide-react';
import { useEffect } from 'react';

interface OrderConfirmationProps {
    order: Order;
}

export default function OrderConfirmation({ order }: OrderConfirmationProps) {
    // Clear checkout data from session storage
    useEffect(() => {
        sessionStorage.removeItem('checkoutData');
    }, []);

    const shippingAddress = order.addresses?.find(
        (addr) => addr.type === 'shipping',
    );
    const billingAddress = order.addresses?.find(
        (addr) => addr.type === 'billing',
    );

    const formatCurrency = (amount: number | string) => {
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(numAmount);
    };

    return (
        <AppLayout>
            <Head title={`Order Confirmation - ${order.order_number}`} />

            <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Success Header */}
                <div className="mb-8 text-center">
                    <div className="mb-4 flex justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                    <h1 className="mb-2 text-3xl font-bold">
                        Thank you for your order!
                    </h1>
                    <p className="text-muted-foreground">
                        Your order has been received and is being processed.
                    </p>
                </div>

                {/* Order Details Card */}
                <Card className="mb-6 p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-medium text-muted-foreground">
                                Order Number
                            </h2>
                            <p className="text-2xl font-bold">
                                {order.order_number}
                            </p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-sm font-medium text-muted-foreground">
                                Order Date
                            </h2>
                            <p className="text-lg font-semibold">
                                {new Date(order.created_at).toLocaleDateString(
                                    'en-US',
                                    {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    },
                                )}
                            </p>
                        </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <div className="mb-2 flex items-center gap-2">
                                <Package className="h-4 w-4 text-muted-foreground" />
                                <h3 className="font-semibold">Order Status</h3>
                            </div>
                            <p className="capitalize text-muted-foreground">
                                {order.status}
                            </p>
                        </div>
                        <div>
                            <div className="mb-2 flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                <h3 className="font-semibold">
                                    Payment Status
                                </h3>
                            </div>
                            <p className="capitalize text-muted-foreground">
                                {order.payment_status}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Order Items */}
                <Card className="mb-6 p-6">
                    <h2 className="mb-4 text-xl font-semibold">Order Items</h2>
                    <div className="space-y-4">
                        {order.items?.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center gap-4"
                            >
                                <div className="h-16 w-16 overflow-hidden rounded-md border bg-muted">
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
                            <span>{formatCurrency(order.total)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tax</span>
                            <span>
                                {formatCurrency(
                                    parseFloat(order.total) * 0.1,
                                )}
                            </span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between text-lg font-bold">
                            <span>Total</span>
                            <span>
                                {formatCurrency(
                                    parseFloat(order.total) * 1.1,
                                )}
                            </span>
                        </div>
                    </div>
                </Card>

                {/* Addresses */}
                <div className="mb-6 grid gap-6 sm:grid-cols-2">
                    {/* Shipping Address */}
                    {shippingAddress && (
                        <Card className="p-6">
                            <div className="mb-3 flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <h3 className="font-semibold">
                                    Shipping Address
                                </h3>
                            </div>
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
                            <div className="mb-3 flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                <h3 className="font-semibold">
                                    Billing Address
                                </h3>
                            </div>
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

                {/* Next Steps */}
                <Card className="mb-6 bg-muted/50 p-6">
                    <h3 className="mb-3 font-semibold">What's Next?</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                            <span>
                                You will receive an order confirmation email
                                shortly
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                            <span>
                                We'll send you a shipping notification when your
                                order ships
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                            <span>
                                You can track your order status in your order
                                history
                            </span>
                        </li>
                    </ul>
                </Card>

                {/* Actions */}
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Button asChild size="lg">
                        <Link href="/">Continue Shopping</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                        <Link href="/orders">View Order History</Link>
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
