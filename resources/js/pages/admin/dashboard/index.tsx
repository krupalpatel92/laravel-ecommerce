import CartStatisticsCard from '@/components/admin/dashboard/cart-statistics-card';
import LowStockCard from '@/components/admin/dashboard/low-stock-card';
import PeriodSelector from '@/components/admin/dashboard/period-selector';
import RecentOrdersCard from '@/components/admin/dashboard/recent-orders-card';
import RevenueChartCard from '@/components/admin/dashboard/revenue-chart-card';
import StatCard from '@/components/admin/dashboard/stat-card';
import TopProductsCard from '@/components/admin/dashboard/top-products-card';
import AppLayout from '@/layouts/app-layout';
import { index as dashboardIndexRoute } from '@/routes/admin/dashboard';
import type { BreadcrumbItem } from '@/types';
import type {
    CartStatistics,
    ChartPeriod,
    DashboardStatistics,
    LowStockItems,
    Period,
    ProductsPeriod,
    RecentOrder,
    RevenueChartData,
    TopProduct,
} from '@/types/dashboard.types';
import { Head } from '@inertiajs/react';
import { AlertTriangle, DollarSign, Package, ShoppingBag } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboardIndexRoute().url,
    },
];

interface Props {
    statistics: DashboardStatistics;
    revenueChartData: RevenueChartData[];
    lowStockItems: LowStockItems;
    topProducts: TopProduct[];
    recentOrders: RecentOrder[];
    cartStatistics: CartStatistics;
    period: Period;
    chartPeriod: ChartPeriod;
    productsPeriod: ProductsPeriod;
}

export default function AdminDashboard({
    statistics,
    revenueChartData,
    lowStockItems,
    topProducts,
    recentOrders,
    cartStatistics,
    period: initialPeriod,
    chartPeriod,
    productsPeriod,
}: Props) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="space-y-6 p-4 md:p-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                        <p className="text-muted-foreground">
                            Overview of your store's performance and metrics
                        </p>
                    </div>
                    <PeriodSelector value={initialPeriod} />
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Revenue"
                        value={formatCurrency(statistics.total_revenue)}
                        change={statistics.revenue_change}
                        period={initialPeriod}
                        icon={DollarSign}
                    />
                    <StatCard
                        title="Orders"
                        value={statistics.total_orders.toString()}
                        change={statistics.orders_change}
                        period={initialPeriod}
                        icon={ShoppingBag}
                    />
                    <StatCard
                        title="Products"
                        value={statistics.total_products.toString()}
                        subtitle={`${statistics.active_products} active`}
                        icon={Package}
                    />
                    <StatCard
                        title="Low Stock"
                        value={statistics.low_stock_count.toString()}
                        subtitle="Items need attention"
                        icon={AlertTriangle}
                        variant="warning"
                    />
                </div>

                {/* Row 1: Revenue Chart + Low Stock */}
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <RevenueChartCard data={revenueChartData} period={chartPeriod} />
                    </div>
                    <div>
                        <LowStockCard items={lowStockItems} />
                    </div>
                </div>

                {/* Row 2: Top Products + Saved Carts */}
                <div className="grid gap-6 lg:grid-cols-3">
                    <div>
                        <TopProductsCard products={topProducts} period={productsPeriod} />
                    </div>
                    <div className="lg:col-span-2">
                        <CartStatisticsCard statistics={cartStatistics} />
                    </div>
                </div>

                {/* Row 3: Recent Orders - Full Width */}
                <RecentOrdersCard orders={recentOrders} />
            </div>
        </AppLayout>
    );
}
