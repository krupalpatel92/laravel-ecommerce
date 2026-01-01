import { Button } from '@/components/ui/button';
import OrderCard from '@/components/orders/order-card';
import AppLayout from '@/layouts/app-layout';
import { Order } from '@/types/order.types';
import { Head, Link, router } from '@inertiajs/react';
import { Package, ChevronLeft, ChevronRight } from 'lucide-react';

interface OrdersIndexProps {
    orders: {
        data: Order[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
}

export default function OrdersIndex({ orders }: OrdersIndexProps) {
    const hasOrders = orders.data.length > 0;

    const handlePageChange = (url: string | null) => {
        if (url) {
            router.visit(url);
        }
    };

    return (
        <AppLayout>
            <Head title="My Orders" />

            <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">My Orders</h1>
                    <p className="mt-2 text-muted-foreground">
                        View and track your order history
                    </p>
                </div>

                {/* Content */}
                {hasOrders ? (
                    <>
                        {/* Orders List */}
                        <div className="space-y-4">
                            {orders.data.map((order) => (
                                <OrderCard key={order.id} order={order} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {orders.last_page > 1 && (
                            <div className="mt-8 flex items-center justify-between border-t pt-6">
                                {/* Results Info */}
                                <div className="text-sm text-muted-foreground">
                                    Showing {orders.from} to {orders.to} of{' '}
                                    {orders.total} orders
                                </div>

                                {/* Pagination Controls */}
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            handlePageChange(
                                                orders.links[0]?.url,
                                            )
                                        }
                                        disabled={
                                            orders.current_page === 1 ||
                                            !orders.links[0]?.url
                                        }
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Previous
                                    </Button>

                                    <div className="flex items-center gap-1">
                                        {orders.links
                                            .slice(1, -1)
                                            .map((link, index) => (
                                                <Button
                                                    key={index}
                                                    variant={
                                                        link.active
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                    size="sm"
                                                    onClick={() =>
                                                        handlePageChange(
                                                            link.url,
                                                        )
                                                    }
                                                    disabled={!link.url}
                                                    className="min-w-[40px]"
                                                >
                                                    {link.label}
                                                </Button>
                                            ))}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            handlePageChange(
                                                orders.links[
                                                    orders.links.length - 1
                                                ]?.url,
                                            )
                                        }
                                        disabled={
                                            orders.current_page ===
                                                orders.last_page ||
                                            !orders.links[
                                                orders.links.length - 1
                                            ]?.url
                                        }
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-20">
                        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                            <Package className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h2 className="mb-2 text-2xl font-semibold">
                            No orders yet
                        </h2>
                        <p className="mb-6 text-center text-muted-foreground">
                            You haven't placed any orders yet.
                            <br />
                            Start shopping to see your orders here.
                        </p>
                        <Button asChild size="lg">
                            <Link href="/products">Start Shopping</Link>
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
