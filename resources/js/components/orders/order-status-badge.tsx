import { Badge } from '@/components/ui/badge';
import {
    CheckCircle,
    Clock,
    Package,
    Truck,
    XCircle,
    RefreshCw,
} from 'lucide-react';

interface OrderStatusBadgeProps {
    status: 'pending' | 'processing' | 'completed' | 'cancelled';
    className?: string;
}

interface PaymentStatusBadgeProps {
    status: 'pending' | 'paid' | 'failed' | 'refunded';
    className?: string;
}

export function OrderStatusBadge({
    status,
    className,
}: OrderStatusBadgeProps) {
    const config = {
        pending: {
            label: 'Pending',
            variant: 'secondary' as const,
            icon: Clock,
        },
        processing: {
            label: 'Processing',
            variant: 'default' as const,
            icon: Package,
        },
        completed: {
            label: 'Completed',
            variant: 'default' as const,
            icon: CheckCircle,
        },
        cancelled: {
            label: 'Cancelled',
            variant: 'destructive' as const,
            icon: XCircle,
        },
    };

    const { label, variant, icon: Icon } = config[status];

    return (
        <Badge variant={variant} className={className}>
            <Icon className="mr-1 h-3 w-3" />
            {label}
        </Badge>
    );
}

export function PaymentStatusBadge({
    status,
    className,
}: PaymentStatusBadgeProps) {
    const config = {
        pending: {
            label: 'Payment Pending',
            variant: 'secondary' as const,
            icon: Clock,
        },
        paid: {
            label: 'Paid',
            variant: 'default' as const,
            icon: CheckCircle,
        },
        failed: {
            label: 'Payment Failed',
            variant: 'destructive' as const,
            icon: XCircle,
        },
        refunded: {
            label: 'Refunded',
            variant: 'secondary' as const,
            icon: RefreshCw,
        },
    };

    const { label, variant, icon: Icon } = config[status];

    return (
        <Badge variant={variant} className={className}>
            <Icon className="mr-1 h-3 w-3" />
            {label}
        </Badge>
    );
}
