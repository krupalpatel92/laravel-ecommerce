import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { ProductsPeriod, TopProduct } from '@/types/dashboard.types';
import { router } from '@inertiajs/react';
import { TrendingUp } from 'lucide-react';

interface TopProductsCardProps {
    products: TopProduct[];
    period: ProductsPeriod;
}

export default function TopProductsCard({ products, period }: TopProductsCardProps) {
    const handlePeriodChange = (newPeriod: ProductsPeriod) => {
        router.get(
            '/admin/dashboard',
            { products_period: newPeriod },
            { preserveState: true, preserveScroll: true }
        );
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-muted-foreground" />
                        <CardTitle>Top Products</CardTitle>
                    </div>
                    <Select value={period} onValueChange={handlePeriodChange}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="week">This Week</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                            <SelectItem value="year">This Year</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                {products.length === 0 ? (
                    <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                        No sales data available for this period
                    </div>
                ) : (
                    <div className="space-y-4">
                        {products.map((product, index) => (
                            <div key={product.id} className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                    {index + 1}
                                </div>
                                {product.image ? (
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="h-12 w-12 rounded-md object-cover"
                                    />
                                ) : (
                                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                                        No Image
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">
                                        {product.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {product.quantity_sold} sold
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold">
                                        {formatCurrency(product.revenue)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatCurrency(product.price)} each
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
