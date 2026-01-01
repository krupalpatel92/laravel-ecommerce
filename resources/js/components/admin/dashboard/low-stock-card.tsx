import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { index as productsIndexRoute } from '@/routes/admin/products';
import type { LowStockItems } from '@/types/dashboard.types';
import { Link } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';

interface LowStockCardProps {
    items: LowStockItems;
}

export default function LowStockCard({ items }: LowStockCardProps) {
    const allItems = [...items.products, ...items.variations];
    const totalLowStock = allItems.length;

    if (totalLowStock === 0) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                        <CardTitle>Low Stock Alerts</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                        All products are well stocked
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        <CardTitle>Low Stock Alerts</CardTitle>
                    </div>
                    <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                        {totalLowStock}
                    </span>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {allItems.slice(0, 5).map((item) => (
                        <div
                            key={`${item.type}-${item.id}`}
                            className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent/50"
                        >
                            {item.image ? (
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="h-12 w-12 rounded-md object-cover"
                                />
                            ) : (
                                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                                    No Image
                                </div>
                            )}
                            <div className="min-w-0 flex-1">
                                <Link
                                    href={`/admin/products/${item.slug}/edit`}
                                    className="block truncate text-sm font-medium hover:underline"
                                >
                                    {item.name}
                                </Link>
                                <p className="text-xs text-muted-foreground">
                                    Stock: {item.stock_quantity} / Threshold:{' '}
                                    {item.alert_threshold}
                                </p>
                            </div>
                            <div
                                className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                    item.stock_quantity === 0
                                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                        : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                                }`}
                            >
                                {item.stock_quantity === 0 ? 'Out' : 'Low'}
                            </div>
                        </div>
                    ))}
                </div>
                {totalLowStock > 5 && (
                    <div className="mt-4">
                        <Button variant="outline" size="sm" className="w-full" asChild>
                            <Link href={productsIndexRoute().url}>
                                View All ({totalLowStock})
                            </Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
