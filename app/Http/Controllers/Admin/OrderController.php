<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateOrderStatusRequest;
use App\Http\Requests\UpdatePaymentStatusRequest;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(): Response
    {
        $search = request('search');
        $status = request('status');
        $paymentStatus = request('payment_status');

        $orders = Order::with([
            'user:id,name,email',
            'items:id,order_id,product_id,variation_id,quantity,price',
            'items.product:id,name,slug',
            'items.variation:id,name',
        ])
            ->when($search, function ($query, $search) {
                $query->where('order_number', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($q) use ($search) {
                        $q->where('email', 'like', "%{$search}%")
                            ->orWhere('name', 'like', "%{$search}%");
                    });
            })
            ->when($status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($paymentStatus, function ($query, $paymentStatus) {
                $query->where('payment_status', $paymentStatus);
            })
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/orders/index', [
            'orders' => $orders,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'payment_status' => $paymentStatus,
            ],
        ]);
    }

    public function show(Order $order): Response
    {
        $order->load([
            'user',
            'items.product.media',
            'items.variation',
            'addresses',
        ]);

        return Inertia::render('admin/orders/show', [
            'order' => $order,
        ]);
    }

    public function updateStatus(UpdateOrderStatusRequest $request, Order $order): RedirectResponse
    {
        $order->update([
            'status' => $request->validated()['status'],
        ]);

        return redirect()
            ->back()
            ->with('success', 'Order status updated successfully.');
    }

    public function updatePaymentStatus(UpdatePaymentStatusRequest $request, Order $order): RedirectResponse
    {
        $order->update([
            'payment_status' => $request->validated()['payment_status'],
        ]);

        return redirect()
            ->back()
            ->with('success', 'Payment status updated successfully.');
    }
}
