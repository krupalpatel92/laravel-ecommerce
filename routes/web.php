<?php

use App\Http\Controllers\Admin\CartController as AdminCartController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\StripeWebhookController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return redirect()->route('products.index');
})->name('home');

Route::get('/cart', function () {
    return Inertia::render('cart/index');
})->name('cart.index');

// Checkout routes (requires authentication)
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/checkout', function () {
        return Inertia::render('checkout/index');
    })->name('checkout.index');

    Route::get('/checkout/shipping', function () {
        return Inertia::render('checkout/shipping');
    })->name('checkout.shipping');

    Route::get('/checkout/payment', function () {
        return Inertia::render('checkout/payment');
    })->name('checkout.payment');

    Route::get('/checkout/confirmation/{orderNumber}', function (string $orderNumber) {
        $order = \App\Models\Order::where('order_number', $orderNumber)
            ->with(['items.product.media', 'items.variation', 'addresses'])
            ->firstOrFail();

        // Ensure user can only view their own orders
        if ($order->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        return Inertia::render('checkout/confirmation', [
            'order' => $order,
        ]);
    })->name('checkout.confirmation');
});

Route::get('/products', function () {
    return Inertia::render('products/index');
})->name('products.index');

Route::get('/products/{slug}', function (string $slug) {
    return Inertia::render('products/show', [
        'slug' => $slug,
    ]);
})->name('products.show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return redirect()->route('products.index');
    })->name('dashboard');

    // Order routes
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');

    Route::prefix('admin')->name('admin.')->middleware('role:superadmin')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard.index');

        Route::resource('categories', CategoryController::class)->except(['show']);
        Route::resource('products', ProductController::class);
        Route::resource('carts', AdminCartController::class)->only(['index', 'show', 'destroy']);

        // Order management routes
        Route::controller(AdminOrderController::class)->prefix('orders')->name('orders.')->group(function () {
            Route::get('/', 'index')->name('index');
            Route::get('/{order}', 'show')->name('show');
            Route::patch('/{order}/status', 'updateStatus')->name('update-status');
            Route::patch('/{order}/payment-status', 'updatePaymentStatus')->name('update-payment-status');
        });
    });
});

// Stripe webhook (excluded from CSRF automatically by Cashier)
Route::post('stripe/webhook', [StripeWebhookController::class, 'handleWebhook'])->name('stripe.webhook');

require __DIR__.'/settings.php';
