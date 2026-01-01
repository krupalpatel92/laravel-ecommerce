import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string;
    change?: number;
    period?: string;
    subtitle?: string;
    icon: LucideIcon;
    variant?: 'default' | 'warning';
}

export default function StatCard({
    title,
    value,
    change,
    period,
    subtitle,
    icon: Icon,
    variant = 'default',
}: StatCardProps) {
    const showChange = change !== undefined && change !== 0;
    const isPositive = change !== undefined && change > 0;
    const isNegative = change !== undefined && change < 0;

    const iconColor = variant === 'warning' ? 'text-orange-500' : 'text-muted-foreground';

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className={`h-4 w-4 ${iconColor}`} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {subtitle && (
                    <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
                )}
                {showChange && period && (
                    <div className="flex items-center gap-1 mt-1">
                        {isPositive && (
                            <>
                                <ArrowUp className="h-3 w-3 text-green-600" />
                                <span className="text-xs font-medium text-green-600">
                                    {change.toFixed(1)}%
                                </span>
                            </>
                        )}
                        {isNegative && (
                            <>
                                <ArrowDown className="h-3 w-3 text-red-600" />
                                <span className="text-xs font-medium text-red-600">
                                    {Math.abs(change).toFixed(1)}%
                                </span>
                            </>
                        )}
                        <span className="text-xs text-muted-foreground">
                            from last {period}
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
