<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Order;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    /**
     * Display a listing of the user's orders.
     */
    public function index(): Response
    {
        $orders = Order::where('user_id', auth()->id())
            ->with(['items.product.media', 'items.variation'])
            ->latest()
            ->paginate(15);

        return Inertia::render('orders/index', [
            'orders' => $orders,
        ]);
    }

    /**
     * Display the specified order.
     */
    public function show(Order $order): Response
    {
        // Ensure user can only view their own orders
        if ($order->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $order->load(['items.product.media', 'items.variation', 'addresses']);

        return Inertia::render('orders/show', [
            'order' => $order,
        ]);
    }
}
