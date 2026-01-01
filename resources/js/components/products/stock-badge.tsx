import { Badge } from '@/components/ui/badge';

interface StockBadgeProps {
    stockStatus: 'in_stock' | 'out_of_stock';
    stockQuantity?: number;
}

export function StockBadge({ stockStatus, stockQuantity }: StockBadgeProps) {
    if (stockStatus === 'out_of_stock') {
        return (
            <Badge variant="destructive" className="font-medium">
                Out of Stock
            </Badge>
        );
    }

    if (stockQuantity !== undefined && stockQuantity <= 5) {
        return (
            <Badge variant="secondary" className="font-medium">
                Only {stockQuantity} left
            </Badge>
        );
    }

    return (
        <Badge variant="default" className="bg-green-600 font-medium hover:bg-green-700">
            In Stock
        </Badge>
    );
}
