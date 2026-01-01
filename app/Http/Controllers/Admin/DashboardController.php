<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariation;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $period = request('period', 'month');
        $chartPeriod = request('chart_period', 'monthly');
        $productsPeriod = request('products_period', 'month');

        $statistics = $this->getStatistics($period);
        $revenueChartData = $this->getRevenueChartData($chartPeriod);
        $lowStockItems = $this->getLowStockItems(10);
        $topProducts = $this->getTopProducts($productsPeriod, 5);
        $recentOrders = $this->getRecentOrders(10);
        $cartStatistics = $this->getCartStatistics();

        return Inertia::render('admin/dashboard/index', [
            'statistics' => $statistics,
            'revenueChartData' => $revenueChartData,
            'lowStockItems' => $lowStockItems,
            'topProducts' => $topProducts,
            'recentOrders' => $recentOrders,
            'cartStatistics' => $cartStatistics,
            'period' => $period,
            'chartPeriod' => $chartPeriod,
            'productsPeriod' => $productsPeriod,
        ]);
    }

    protected function getStatistics(string $period = 'month'): array
    {
        return Cache::remember("dashboard.statistics.{$period}", 900, function () use ($period) {
            $startDate = match ($period) {
                'week' => now()->subWeek(),
                'month' => now()->subMonth(),
                'year' => now()->subYear(),
                default => now()->subMonth(),
            };

            // Get current period statistics
            $currentRevenue = Order::where('payment_status', 'paid')
                ->where('created_at', '>=', $startDate)
                ->sum('total');

            $currentOrders = Order::where('created_at', '>=', $startDate)
                ->count();

            // Get previous period for comparison
            $previousStartDate = match ($period) {
                'week' => now()->subWeeks(2),
                'month' => now()->subMonths(2),
                'year' => now()->subYears(2),
                default => now()->subMonths(2),
            };

            $previousRevenue = Order::where('payment_status', 'paid')
                ->whereBetween('created_at', [$previousStartDate, $startDate])
                ->sum('total');

            $previousOrders = Order::whereBetween('created_at', [$previousStartDate, $startDate])
                ->count();

            // Calculate percentage changes
            $revenueChange = $previousRevenue > 0
                ? (($currentRevenue - $previousRevenue) / $previousRevenue) * 100
                : 0;

            $ordersChange = $previousOrders > 0
                ? (($currentOrders - $previousOrders) / $previousOrders) * 100
                : 0;

            // Get product statistics
            $totalProducts = Product::count();
            $activeProducts = Product::where('status', 'active')->count();

            // Get low stock count (products and variations below threshold)
            $lowStockProducts = Product::where('type', 'single')
                ->whereColumn('stock_quantity', '<=', 'alert_threshold')
                ->where('stock_quantity', '>', 0)
                ->count();

            $lowStockVariations = ProductVariation::whereColumn('stock_quantity', '<=', 'alert_threshold')
                ->where('stock_quantity', '>', 0)
                ->count();

            $lowStockCount = $lowStockProducts + $lowStockVariations;

            return [
                'total_revenue' => (float) $currentRevenue,
                'revenue_change' => round($revenueChange, 1),
                'total_orders' => $currentOrders,
                'orders_change' => round($ordersChange, 1),
                'total_products' => $totalProducts,
                'active_products' => $activeProducts,
                'low_stock_count' => $lowStockCount,
            ];
        });
    }

    protected function getRevenueChartData(string $period = 'monthly'): array
    {
        return Cache::remember("dashboard.revenue.{$period}", 900, function () use ($period) {
            return match ($period) {
                'daily' => $this->getDailyRevenue(),
                'weekly' => $this->getWeeklyRevenue(),
                'monthly' => $this->getMonthlyRevenue(),
                default => $this->getMonthlyRevenue(),
            };
        });
    }

    protected function getDailyRevenue(): array
    {
        $days = 30;
        $data = [];

        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i);

            $dayData = Order::where('payment_status', 'paid')
                ->whereDate('created_at', $date)
                ->selectRaw('
                    DATE(created_at) as date,
                    COALESCE(SUM(total), 0) as revenue,
                    COUNT(*) as orders
                ')
                ->groupBy('date')
                ->first();

            $data[] = [
                'date' => $date->format('M d'),
                'revenue' => $dayData ? (float) $dayData->revenue : 0,
                'orders' => $dayData ? $dayData->orders : 0,
                'average_order_value' => $dayData && $dayData->orders > 0
                    ? (float) $dayData->revenue / $dayData->orders
                    : 0,
            ];
        }

        return $data;
    }

    protected function getWeeklyRevenue(): array
    {
        $weeks = 12;
        $data = [];

        for ($i = $weeks - 1; $i >= 0; $i--) {
            $startOfWeek = now()->subWeeks($i)->startOfWeek();
            $endOfWeek = now()->subWeeks($i)->endOfWeek();

            $weekData = Order::where('payment_status', 'paid')
                ->whereBetween('created_at', [$startOfWeek, $endOfWeek])
                ->selectRaw('
                    COALESCE(SUM(total), 0) as revenue,
                    COUNT(*) as orders
                ')
                ->first();

            $data[] = [
                'date' => $startOfWeek->format('M d'),
                'revenue' => $weekData ? (float) $weekData->revenue : 0,
                'orders' => $weekData ? $weekData->orders : 0,
                'average_order_value' => $weekData && $weekData->orders > 0
                    ? (float) $weekData->revenue / $weekData->orders
                    : 0,
            ];
        }

        return $data;
    }

    protected function getMonthlyRevenue(): array
    {
        $months = 12;
        $data = [];

        for ($i = $months - 1; $i >= 0; $i--) {
            $month = now()->subMonths($i);

            $monthData = Order::where('payment_status', 'paid')
                ->whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->selectRaw('
                    COALESCE(SUM(total), 0) as revenue,
                    COUNT(*) as orders
                ')
                ->first();

            $data[] = [
                'date' => $month->format('M Y'),
                'revenue' => $monthData ? (float) $monthData->revenue : 0,
                'orders' => $monthData ? $monthData->orders : 0,
                'average_order_value' => $monthData && $monthData->orders > 0
                    ? (float) $monthData->revenue / $monthData->orders
                    : 0,
            ];
        }

        return $data;
    }

    protected function getLowStockItems(int $limit = 10): array
    {
        return Cache::remember('dashboard.low_stock', 300, function () use ($limit) {
            // Get single products below threshold
            $products = Product::where('type', 'single')
                ->whereColumn('stock_quantity', '<=', 'alert_threshold')
                ->where('stock_quantity', '>', 0)
                ->select(['id', 'name', 'slug', 'stock_quantity', 'alert_threshold'])
                ->limit($limit)
                ->get();

            // Get product variations below threshold
            $variations = ProductVariation::whereColumn('stock_quantity', '<=', 'alert_threshold')
                ->where('stock_quantity', '>', 0)
                ->with(['product' => function ($query) {
                    $query->select(['id', 'name', 'slug']);
                }])
                ->select(['id', 'product_id', 'name', 'sku', 'stock_quantity', 'alert_threshold'])
                ->limit($limit)
                ->get();

            return [
                'products' => $products->map(function ($product) {
                    return [
                        'id' => $product->id,
                        'name' => $product->name,
                        'slug' => $product->slug,
                        'stock_quantity' => $product->stock_quantity,
                        'alert_threshold' => $product->alert_threshold,
                        'image' => null,
                        'type' => 'product',
                    ];
                })->toArray(),
                'variations' => $variations->map(function ($variation) {
                    return [
                        'id' => $variation->id,
                        'product_id' => $variation->product_id,
                        'name' => $variation->product->name.' - '.$variation->name,
                        'slug' => $variation->product->slug,
                        'stock_quantity' => $variation->stock_quantity,
                        'alert_threshold' => $variation->alert_threshold,
                        'image' => null,
                        'type' => 'variation',
                        'sku' => $variation->sku,
                    ];
                })->toArray(),
            ];
        });
    }

    protected function getTopProducts(string $period = 'month', int $limit = 5): array
    {
        return Cache::remember("dashboard.top_products.{$period}", 600, function () use ($period, $limit) {
            $startDate = match ($period) {
                'week' => now()->subWeek(),
                'month' => now()->subMonth(),
                'year' => now()->subYear(),
                default => now()->subMonth(),
            };

            $topProducts = OrderItem::whereHas('order', function ($query) use ($startDate) {
                $query->where('payment_status', 'paid')
                    ->where('created_at', '>=', $startDate);
            })
                ->select([
                    'product_id',
                    DB::raw('SUM(quantity) as total_quantity'),
                    DB::raw('SUM(price * quantity) as total_revenue'),
                ])
                ->with(['product' => function ($query) {
                    $query->select(['id', 'name', 'slug', 'price']);
                }])
                ->groupBy('product_id')
                ->orderByDesc('total_quantity')
                ->limit($limit)
                ->get();

            return $topProducts->map(function ($item) {
                return [
                    'id' => $item->product_id,
                    'name' => $item->product->name,
                    'slug' => $item->product->slug,
                    'quantity_sold' => (int) $item->total_quantity,
                    'revenue' => (float) $item->total_revenue,
                    'price' => (float) $item->product->price,
                    'image' => null,
                ];
            })->toArray();
        });
    }

    protected function getRecentOrders(int $limit = 10): array
    {
        return Cache::remember('dashboard.recent_orders', 300, function () use ($limit) {
            return Order::with([
                'user:id,name,email',
                'items:id,order_id,quantity',
            ])
                ->select(['id', 'user_id', 'order_number', 'total', 'status', 'payment_status', 'created_at'])
                ->latest()
                ->limit($limit)
                ->get()
                ->map(function ($order) {
                    return [
                        'id' => $order->id,
                        'order_number' => $order->order_number,
                        'customer_name' => $order->user?->name ?? 'Guest',
                        'customer_email' => $order->user?->email ?? null,
                        'total' => (float) $order->total,
                        'items_count' => $order->items->sum('quantity'),
                        'status' => $order->status,
                        'payment_status' => $order->payment_status,
                        'created_at' => $order->created_at->toISOString(),
                    ];
                })
                ->toArray();
        });
    }

    protected function getCartStatistics(): array
    {
        return Cache::remember('dashboard.cart_statistics', 600, function () {
            $activeCartsCount = Cart::where('expires_at', '>', now())->count();

            $cartData = Cart::where('expires_at', '>', now())
                ->with('items')
                ->get();

            $totalCartValue = $cartData->sum(function ($cart) {
                return $cart->items->sum(function ($item) {
                    return $item->price * $item->quantity;
                });
            });

            $authenticatedCarts = $cartData->filter(fn ($cart) => $cart->user_id !== null)->count();
            $guestCarts = $cartData->filter(fn ($cart) => $cart->user_id === null)->count();

            $averageCartValue = $activeCartsCount > 0
                ? $totalCartValue / $activeCartsCount
                : 0;

            // Get abandoned carts (not modified in last 24 hours)
            $abandonedCarts = Cart::where('expires_at', '>', now())
                ->where('updated_at', '<', now()->subHours(24))
                ->count();

            // Recent cart activity (carts created/updated in last 24 hours)
            $recentActivity = Cart::where('expires_at', '>', now())
                ->where('updated_at', '>=', now()->subHours(24))
                ->with(['user:id,name,email', 'items'])
                ->latest('updated_at')
                ->limit(5)
                ->get()
                ->map(function ($cart) {
                    $cartValue = $cart->items->sum(function ($item) {
                        return $item->price * $item->quantity;
                    });

                    return [
                        'id' => $cart->id,
                        'customer_name' => $cart->user?->name ?? 'Guest',
                        'customer_email' => $cart->user?->email ?? null,
                        'items_count' => $cart->items->count(),
                        'total_value' => (float) $cartValue,
                        'updated_at' => $cart->updated_at->toISOString(),
                        'is_guest' => $cart->user_id === null,
                    ];
                })
                ->toArray();

            return [
                'total_active_carts' => $activeCartsCount,
                'total_cart_value' => (float) $totalCartValue,
                'authenticated_carts' => $authenticatedCarts,
                'guest_carts' => $guestCarts,
                'average_cart_value' => (float) $averageCartValue,
                'abandoned_carts' => $abandonedCarts,
                'recent_activity' => $recentActivity,
            ];
        });
    }
}
