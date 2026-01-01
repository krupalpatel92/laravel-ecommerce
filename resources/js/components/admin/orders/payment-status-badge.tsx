import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PaymentStatusBadgeProps {
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    className?: string;
}

const paymentStatusConfig = {
    pending: {
        label: 'Pending',
        className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    },
    paid: {
        label: 'Paid',
        className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    },
    failed: {
        label: 'Failed',
        className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    },
    refunded: {
        label: 'Refunded',
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    },
};

export default function PaymentStatusBadge({
    paymentStatus,
    className,
}: PaymentStatusBadgeProps) {
    const config = paymentStatusConfig[paymentStatus];

    return (
        <Badge className={cn(config.className, className)} variant="outline">
            {config.label}
        </Badge>
    );
}
