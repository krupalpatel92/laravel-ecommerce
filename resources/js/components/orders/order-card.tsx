import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Order } from '@/types/order.types';
import { Link } from '@inertiajs/react';
import { Package } from 'lucide-react';
import { OrderStatusBadge, PaymentStatusBadge } from './order-status-badge';

interface OrderCardProps {
    order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
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
            month: 'short',
            day: 'numeric',
        });
    };

    const itemCount = order.items?.length || 0;
    const firstThreeItems = order.items?.slice(0, 3) || [];

    return (
        <Card className="p-6 transition-shadow hover:shadow-md">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Left Section: Order Info */}
                <div className="flex-1 space-y-3">
                    {/* Order Number and Date */}
                    <div>
                        <h3 className="text-lg font-semibold">
                            Order #{order.order_number}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {formatDate(order.created_at)}
                        </p>
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-2">
                        <OrderStatusBadge status={order.status} />
                        <PaymentStatusBadge status={order.payment_status} />
                    </div>

                    {/* Product Images */}
                    <div className="flex items-center gap-4">
                        <div className="flex -space-x-2">
                            {firstThreeItems.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="h-10 w-10 overflow-hidden rounded-md border-2 border-background bg-muted"
                                    style={{ zIndex: 3 - index }}
                                >
                                    {item.product?.primary_image_url ? (
                                        <img
                                            src={item.product.primary_image_url}
                                            alt={item.product.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <Package className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {itemCount} {itemCount === 1 ? 'item' : 'items'}
                        </div>
                    </div>
                </div>

                {/* Right Section: Total and Action */}
                <div className="flex flex-col items-start gap-3 sm:items-end">
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-2xl font-bold">
                            {formatCurrency(order.total)}
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={`/orders/${order.id}`}>View Details</Link>
                    </Button>
                </div>
            </div>
        </Card>
    );
}
