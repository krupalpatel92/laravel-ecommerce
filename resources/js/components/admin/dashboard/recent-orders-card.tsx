import OrderStatusBadge from '@/components/admin/orders/order-status-badge';
import PaymentStatusBadge from '@/components/admin/orders/payment-status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { index as ordersIndexRoute, show as showOrderRoute } from '@/routes/admin/orders';
import type { RecentOrder } from '@/types/dashboard.types';
import { Link } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import { Package } from 'lucide-react';

interface RecentOrdersCardProps {
    orders: RecentOrder[];
}

export default function RecentOrdersCard({ orders }: RecentOrdersCardProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-muted-foreground" />
                        <CardTitle>Recent Orders</CardTitle>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={ordersIndexRoute().url}>View All</Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {orders.length === 0 ? (
                    <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                        No recent orders
                    </div>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Payment</TableHead>
                                    <TableHead>Time</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order) => (
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
                                            <div className="flex flex-col">
                                                <span className="text-sm">
                                                    {order.customer_name}
                                                </span>
                                                {order.customer_email && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {order.items_count} items
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {formatCurrency(order.total)}
                                        </TableCell>
                                        <TableCell>
                                            <OrderStatusBadge status={order.status} />
                                        </TableCell>
                                        <TableCell>
                                            <PaymentStatusBadge
                                                paymentStatus={order.payment_status}
                                            />
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(order.created_at), {
                                                addSuffix: true,
                                            })}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
