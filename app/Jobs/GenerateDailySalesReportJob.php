<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Order;
use App\Models\User;
use App\Notifications\DailySalesReportNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

class GenerateDailySalesReportJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public ?string $date = null
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Get all superadmin users to notify
        $superAdmins = User::role('superadmin')->get();

        if ($superAdmins->isEmpty()) {
            return;
        }

        // Get the target date (default to today)
        $targetDate = $this->date ? date('Y-m-d', strtotime($this->date)) : today()->toDateString();

        // Aggregate sales data
        $salesData = $this->aggregateSalesData($targetDate);

        // Send notification to all superadmins
        Notification::send(
            $superAdmins,
            new DailySalesReportNotification($salesData)
        );
    }

    /**
     * Aggregate sales data for the given date.
     */
    protected function aggregateSalesData(string $date): array
    {
        // Get all orders for the date
        $orders = Order::with(['items.product'])
            ->whereDate('created_at', $date)
            ->get();

        // Calculate basic metrics
        $totalOrders = $orders->count();
        $totalRevenue = $orders->sum('total');
        $averageOrderValue = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;

        // Calculate total items sold
        $totalItemsSold = $orders->sum(function ($order) {
            return $order->items->sum('quantity');
        });

        // Payment status breakdown
        $paymentStatus = [
            'paid' => $orders->where('payment_status', 'paid')->count(),
            'pending' => $orders->where('payment_status', 'pending')->count(),
            'failed' => $orders->where('payment_status', 'failed')->count(),
        ];

        // Order status breakdown
        $orderStatus = [
            'completed' => $orders->where('status', 'completed')->count(),
            'processing' => $orders->where('status', 'processing')->count(),
            'pending' => $orders->where('status', 'pending')->count(),
            'cancelled' => $orders->where('status', 'cancelled')->count(),
        ];

        // Get top 5 selling products
        $topProducts = $this->getTopSellingProducts($date);

        return [
            'date' => $date,
            'total_orders' => $totalOrders,
            'total_revenue' => $totalRevenue,
            'average_order_value' => $averageOrderValue,
            'total_items_sold' => $totalItemsSold,
            'payment_status' => $paymentStatus,
            'order_status' => $orderStatus,
            'top_products' => $topProducts,
        ];
    }

    /**
     * Get top 5 selling products for the given date.
     */
    protected function getTopSellingProducts(string $date): array
    {
        $topProducts = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->whereDate('orders.created_at', $date)
            ->select(
                'products.name',
                DB::raw('SUM(order_items.quantity) as total_quantity'),
                DB::raw('SUM(order_items.price * order_items.quantity) as total_revenue')
            )
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('total_quantity')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->name,
                    'quantity' => (int) $item->total_quantity,
                    'revenue' => (float) $item->total_revenue,
                ];
            })
            ->toArray();

        return $topProducts;
    }
}
