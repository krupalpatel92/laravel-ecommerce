import OrderStatusBadge from '@/components/admin/orders/order-status-badge';
import PaymentStatusBadge from '@/components/admin/orders/payment-status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { index as ordersIndexRoute, show as showOrderRoute } from '@/routes/admin/orders';
import type { BreadcrumbItem } from '@/types';
import type { Order, OrdersData } from '@/types/order.types';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { Eye, Search } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Orders',
        href: ordersIndexRoute().url,
    },
];

interface Props {
    orders: OrdersData;
    filters?: {
        search?: string;
        status?: string;
        payment_status?: string;
    };
}

export default function OrdersIndex({ orders, filters }: Props) {
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || '');
    const [paymentStatus, setPaymentStatus] = useState(
        filters?.payment_status || ''
    );
    const [isFiltering, setIsFiltering] = useState(false);

    const handleFilter = () => {
        setIsFiltering(true);
        router.get(
            ordersIndexRoute().url,
            {
                search: search || undefined,
                status: status || undefined,
                payment_status: paymentStatus || undefined,
            },
            {
                preserveState: true,
                onFinish: () => setIsFiltering(false),
            }
        );
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        setPaymentStatus('');
        router.get(ordersIndexRoute().url);
    };

    const formatCurrency = (amount: string | number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(Number(amount));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Orders" />

            <div className="space-y-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Orders
                        </h1>
                        <p className="text-muted-foreground">
                            Manage customer orders and update statuses
                        </p>
                    </div>
                    <Badge variant="secondary">{orders.total} total</Badge>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by order number or customer email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleFilter();
                                }
                            }}
                            className="pl-9"
                        />
                    </div>
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Order Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value=" ">All Statuses</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">
                                Processing
                            </SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        value={paymentStatus}
                        onValueChange={setPaymentStatus}
                    >
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Payment Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value=" ">All Payments</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                            <SelectItem value="refunded">Refunded</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                        <Button
                            onClick={handleFilter}
                            disabled={isFiltering}
                            className="flex-1 sm:flex-initial"
                        >
                            Filter
                        </Button>
                        <Button
                            onClick={handleReset}
                            variant="outline"
                            className="flex-1 sm:flex-initial"
                        >
                            Reset
                        </Button>
                    </div>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Items</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Payment</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="h-24 text-center"
                                    >
                                        No orders found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                orders.data.map((order: Order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium">
                                            <Link
                                                href={showOrderRoute(order.id).url}
                                                className="text-primary hover:underline"
                                            >
                                                {order.order_number}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            {order.user ? (
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {order.user.name}
                                                    </span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {order.user.email}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">
                                                    Guest
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {format(
                                                new Date(order.created_at),
                                                'MMM d, yyyy'
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {order.items?.length || 0}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {formatCurrency(order.total)}
                                        </TableCell>
                                        <TableCell>
                                            <OrderStatusBadge
                                                status={order.status}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <PaymentStatusBadge
                                                paymentStatus={
                                                    order.payment_status
                                                }
                                            />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                asChild
                                            >
                                                <Link
                                                    href={
                                                        showOrderRoute(order.id)
                                                            .url
                                                    }
                                                >
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {orders.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            Showing {(orders.current_page - 1) * orders.per_page + 1} to{' '}
                            {Math.min(
                                orders.current_page * orders.per_page,
                                orders.total
                            )}{' '}
                            of {orders.total} orders
                        </div>
                        <div className="flex gap-2">
                            {orders.links.map((link, index) => {
                                if (
                                    link.label === '&laquo; Previous' ||
                                    link.label === 'Next &raquo;'
                                ) {
                                    return (
                                        <Button
                                            key={index}
                                            variant="outline"
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() => {
                                                if (link.url) {
                                                    router.get(link.url);
                                                }
                                            }}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    );
                                }
                                return (
                                    <Button
                                        key={index}
                                        variant={
                                            link.active ? 'default' : 'outline'
                                        }
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => {
                                            if (link.url) {
                                                router.get(link.url);
                                            }
                                        }}
                                    >
                                        {link.label}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
