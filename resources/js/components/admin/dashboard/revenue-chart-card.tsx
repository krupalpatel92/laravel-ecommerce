import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { ChartPeriod, RevenueChartData } from '@/types/dashboard.types';
import { router } from '@inertiajs/react';
import { BarChart3 } from 'lucide-react';
import { useMemo } from 'react';
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface RevenueChartCardProps {
    data: RevenueChartData[];
    period: ChartPeriod;
}

export default function RevenueChartCard({ data, period }: RevenueChartCardProps) {
    const handlePeriodChange = (newPeriod: ChartPeriod) => {
        router.get(
            '/admin/dashboard',
            { chart_period: newPeriod },
            { preserveState: true, preserveScroll: true }
        );
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="rounded-lg border bg-background p-3 shadow-lg">
                    <p className="text-sm font-semibold">{payload[0].payload.date}</p>
                    <div className="mt-2 space-y-1 text-sm">
                        <p className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">Revenue:</span>
                            <span className="font-semibold text-blue-600">
                                {formatCurrency(payload[0].value)}
                            </span>
                        </p>
                        <p className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">Orders:</span>
                            <span className="font-semibold">
                                {payload[0].payload.orders}
                            </span>
                        </p>
                        <p className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">Avg Order:</span>
                            <span className="font-semibold">
                                {formatCurrency(payload[0].payload.average_order_value)}
                            </span>
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    };

    const totalRevenue = useMemo(
        () => data.reduce((sum, item) => sum + item.revenue, 0),
        [data]
    );

    const totalOrders = useMemo(
        () => data.reduce((sum, item) => sum + item.orders, 0),
        [data]
    );

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-muted-foreground" />
                        <CardTitle>Revenue Overview</CardTitle>
                    </div>
                    <Select value={period} onValueChange={handlePeriodChange}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="mt-4 flex gap-8">
                    <div>
                        <p className="text-sm text-muted-foreground">Total Revenue</p>
                        <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total Orders</p>
                        <p className="text-2xl font-bold">{totalOrders}</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart
                            data={data}
                            margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                className="stroke-muted"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="date"
                                className="text-xs"
                                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                tickLine={{ stroke: 'hsl(var(--border))' }}
                            />
                            <YAxis
                                className="text-xs"
                                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                tickLine={{ stroke: 'hsl(var(--border))' }}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                dot={{ fill: 'hsl(var(--primary))' }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex h-[350px] items-center justify-center text-muted-foreground">
                        No revenue data available for this period
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
