import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CartStatistics } from '@/types/dashboard.types';
import { formatDistanceToNow } from 'date-fns';
import { ShoppingCart } from 'lucide-react';

interface CartStatisticsCardProps {
    statistics: CartStatistics;
}

export default function CartStatisticsCard({ statistics }: CartStatisticsCardProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                    <CardTitle>Saved Carts</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Summary Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-lg border p-3">
                            <p className="text-sm text-muted-foreground">Active Carts</p>
                            <p className="text-2xl font-bold">
                                {statistics.total_active_carts}
                            </p>
                        </div>
                        <div className="rounded-lg border p-3">
                            <p className="text-sm text-muted-foreground">Total Value</p>
                            <p className="text-2xl font-bold">
                                {formatCurrency(statistics.total_cart_value)}
                            </p>
                        </div>
                        <div className="rounded-lg border p-3">
                            <p className="text-sm text-muted-foreground">Avg. Cart Value</p>
                            <p className="text-xl font-bold">
                                {formatCurrency(statistics.average_cart_value)}
                            </p>
                        </div>
                        <div className="rounded-lg border p-3">
                            <p className="text-sm text-muted-foreground">Abandoned</p>
                            <p className="text-xl font-bold text-orange-600">
                                {statistics.abandoned_carts}
                            </p>
                        </div>
                    </div>

                    {/* Cart Breakdown */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Cart Breakdown</p>
                        <div className="flex gap-2">
                            <div className="flex-1 rounded-lg bg-blue-100 p-2 dark:bg-blue-900">
                                <p className="text-xs text-blue-800 dark:text-blue-300">
                                    Authenticated
                                </p>
                                <p className="text-lg font-bold text-blue-900 dark:text-blue-200">
                                    {statistics.authenticated_carts}
                                </p>
                            </div>
                            <div className="flex-1 rounded-lg bg-gray-100 p-2 dark:bg-gray-800">
                                <p className="text-xs text-gray-800 dark:text-gray-300">
                                    Guest
                                </p>
                                <p className="text-lg font-bold text-gray-900 dark:text-gray-200">
                                    {statistics.guest_carts}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    {statistics.recent_activity.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium">Recent Activity</p>
                            <div className="space-y-2">
                                {statistics.recent_activity.map((cart) => (
                                    <div
                                        key={cart.id}
                                        className="flex items-center justify-between rounded-lg border p-2 text-sm"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-medium">
                                                {cart.customer_name}
                                                {cart.is_guest && (
                                                    <span className="ml-2 rounded bg-gray-200 px-1.5 py-0.5 text-xs dark:bg-gray-700">
                                                        Guest
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {cart.items_count} items
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">
                                                {formatCurrency(cart.total_value)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(cart.updated_at), {
                                                    addSuffix: true,
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {statistics.total_active_carts === 0 && (
                        <div className="flex h-[100px] items-center justify-center text-sm text-muted-foreground">
                            No active carts
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
