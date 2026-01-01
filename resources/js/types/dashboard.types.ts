export interface DashboardStatistics {
    total_revenue: number;
    revenue_change: number;
    total_orders: number;
    orders_change: number;
    total_products: number;
    active_products: number;
    low_stock_count: number;
}

export type Period = 'week' | 'month' | 'year';

export interface RevenueChartData {
    date: string;
    revenue: number;
    orders: number;
    average_order_value: number;
}

export type ChartPeriod = 'daily' | 'weekly' | 'monthly';

export interface LowStockItem {
    id: number;
    product_id?: number;
    name: string;
    slug: string;
    stock_quantity: number;
    alert_threshold: number;
    image: string | null;
    type: 'product' | 'variation';
    sku?: string;
}

export interface LowStockItems {
    products: LowStockItem[];
    variations: LowStockItem[];
}

export interface TopProduct {
    id: number;
    name: string;
    slug: string;
    quantity_sold: number;
    revenue: number;
    price: number;
    image: string | null;
}

export interface RecentOrder {
    id: number;
    order_number: string;
    customer_name: string;
    customer_email: string | null;
    total: number;
    items_count: number;
    status: 'pending' | 'processing' | 'completed' | 'cancelled';
    payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
    created_at: string;
}

export type ProductsPeriod = 'week' | 'month' | 'year';

export interface CartActivity {
    id: number;
    customer_name: string;
    customer_email: string | null;
    items_count: number;
    total_value: number;
    updated_at: string;
    is_guest: boolean;
}

export interface CartStatistics {
    total_active_carts: number;
    total_cart_value: number;
    authenticated_carts: number;
    guest_carts: number;
    average_cart_value: number;
    abandoned_carts: number;
    recent_activity: CartActivity[];
}
