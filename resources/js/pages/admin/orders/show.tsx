import OrderStatusBadge from '@/components/admin/orders/order-status-badge';
import PaymentStatusBadge from '@/components/admin/orders/payment-status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { index as ordersIndexRoute } from '@/routes/admin/orders';
import type { BreadcrumbItem } from '@/types';
import type { Order } from '@/types/order.types';
import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

interface Props {
    order: Order;
}

export default function OrderShow({ order }: Props) {
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Orders',
            href: ordersIndexRoute().url,
        },
        {
            title: order.order_number,
            href: '#',
        },
    ];

    const formatCurrency = (amount: string | number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(Number(amount));
    };

    const handleStatusUpdate = (newStatus: string) => {
        setIsUpdatingStatus(true);
        router.patch(
            `/admin/orders/${order.id}/status`,
            { status: newStatus },
            {
                preserveScroll: true,
                onFinish: () => setIsUpdatingStatus(false),
            }
        );
    };

    const handlePaymentStatusUpdate = (newStatus: string) => {
        setIsUpdatingPayment(true);
        router.patch(
            `/admin/orders/${order.id}/payment-status`,
            { payment_status: newStatus },
            {
                preserveScroll: true,
                onFinish: () => setIsUpdatingPayment(false),
            }
        );
    };

    const shippingAddress = order.addresses?.find((a) => a.type === 'shipping');
    const billingAddress = order.addresses?.find((a) => a.type === 'billing');

    const calculateSubtotal = () => {
        return order.items?.reduce((sum, item) => {
            return sum + Number(item.price) * item.quantity;
        }, 0) || 0;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Order ${order.order_number}`} />

            <div className="space-y-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.visit(ordersIndexRoute().url)}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Order {order.order_number}
                            </h1>
                            <p className="text-muted-foreground">
                                Placed on{' '}
                                {format(
                                    new Date(order.created_at),
                                    'MMM d, yyyy h:mm a'
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Items</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead className="text-right">
                                                Total
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {order.items?.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">
                                                            {item.product?.name ||
                                                                'Unknown Product'}
                                                        </span>
                                                        {item.variation && (
                                                            <span className="text-sm text-muted-foreground">
                                                                Variation:{' '}
                                                                {
                                                                    item
                                                                        .variation
                                                                        .name
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {item.quantity}
                                                </TableCell>
                                                <TableCell>
                                                    {formatCurrency(item.price)}
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {formatCurrency(
                                                        Number(item.price) *
                                                            item.quantity
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Customer Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {order.user ? (
                                    <div className="space-y-2">
                                        <div>
                                            <span className="text-sm text-muted-foreground">
                                                Name
                                            </span>
                                            <p className="font-medium">
                                                {order.user.name}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-muted-foreground">
                                                Email
                                            </span>
                                            <p className="font-medium">
                                                {order.user.email}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">
                                        Guest checkout
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {shippingAddress && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Shipping Address</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <address className="not-italic">
                                        <p className="font-medium">
                                            {shippingAddress.first_name}{' '}
                                            {shippingAddress.last_name}
                                        </p>
                                        <p>{shippingAddress.address_line1}</p>
                                        {shippingAddress.address_line2 && (
                                            <p>
                                                {shippingAddress.address_line2}
                                            </p>
                                        )}
                                        <p>
                                            {shippingAddress.city},{' '}
                                            {shippingAddress.state}{' '}
                                            {shippingAddress.postal_code}
                                        </p>
                                        <p>{shippingAddress.country}</p>
                                        <p className="mt-2">
                                            Phone: {shippingAddress.phone}
                                        </p>
                                    </address>
                                </CardContent>
                            </Card>
                        )}

                        {billingAddress && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Billing Address</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <address className="not-italic">
                                        <p className="font-medium">
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
                                        <p className="mt-2">
                                            Phone: {billingAddress.phone}
                                        </p>
                                    </address>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Subtotal
                                    </span>
                                    <span className="font-medium">
                                        {formatCurrency(calculateSubtotal())}
                                    </span>
                                </div>
                                <div className="border-t pt-4">
                                    <div className="flex justify-between">
                                        <span className="font-semibold">
                                            Total
                                        </span>
                                        <span className="font-semibold">
                                            {formatCurrency(order.total)}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2 border-t pt-4">
                                    <div>
                                        <span className="text-sm text-muted-foreground">
                                            Order Status
                                        </span>
                                        <div className="mt-1">
                                            <OrderStatusBadge
                                                status={order.status}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-muted-foreground">
                                            Payment Status
                                        </span>
                                        <div className="mt-1">
                                            <PaymentStatusBadge
                                                paymentStatus={
                                                    order.payment_status
                                                }
                                            />
                                        </div>
                                    </div>
                                    {order.stripe_payment_intent_id && (
                                        <div>
                                            <span className="text-sm text-muted-foreground">
                                                Payment Intent ID
                                            </span>
                                            <p className="text-xs font-mono">
                                                {order.stripe_payment_intent_id}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Update Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Order Status
                                    </label>
                                    <Select
                                        value={order.status}
                                        onValueChange={handleStatusUpdate}
                                        disabled={isUpdatingStatus}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">
                                                Pending
                                            </SelectItem>
                                            <SelectItem value="processing">
                                                Processing
                                            </SelectItem>
                                            <SelectItem value="completed">
                                                Completed
                                            </SelectItem>
                                            <SelectItem value="cancelled">
                                                Cancelled
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Payment Status
                                    </label>
                                    <Select
                                        value={order.payment_status}
                                        onValueChange={
                                            handlePaymentStatusUpdate
                                        }
                                        disabled={isUpdatingPayment}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">
                                                Pending
                                            </SelectItem>
                                            <SelectItem value="paid">
                                                Paid
                                            </SelectItem>
                                            <SelectItem value="failed">
                                                Failed
                                            </SelectItem>
                                            <SelectItem value="refunded">
                                                Refunded
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
