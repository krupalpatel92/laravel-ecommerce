import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface OrderStatusBadgeProps {
    status: 'pending' | 'processing' | 'completed' | 'cancelled';
    className?: string;
}

const statusConfig = {
    pending: {
        label: 'Pending',
        className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    },
    processing: {
        label: 'Processing',
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    },
    completed: {
        label: 'Completed',
        className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    },
    cancelled: {
        label: 'Cancelled',
        className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    },
};

export default function OrderStatusBadge({
    status,
    className,
}: OrderStatusBadgeProps) {
    const config = statusConfig[status];

    return (
        <Badge className={cn(config.className, className)} variant="outline">
            {config.label}
        </Badge>
    );
}
