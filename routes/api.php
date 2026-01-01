<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\AddressController;
use App\Http\Controllers\Api\V1\CartController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\ProductImageController;
use App\Http\Controllers\Api\V1\PublicProductController;
use Illuminate\Support\Facades\Route;

// Public product routes (no auth required)
Route::prefix('v1/public')->name('api.v1.public.')->group(function () {
    Route::get('products', [PublicProductController::class, 'index'])->name('products.index');
    Route::get('products/{slug}', [PublicProductController::class, 'show'])->name('products.show');
});

// Cart routes (no auth required - works for both guests and authenticated users)
Route::prefix('v1')->name('api.v1.')->group(function () {
    Route::get('cart', [CartController::class, 'index'])->name('cart.index');
    Route::post('cart/items', [CartController::class, 'store'])->name('cart.store');
    Route::put('cart/items/{cartItem}', [CartController::class, 'update'])->name('cart.update');
    Route::delete('cart/items/{cartItem}', [CartController::class, 'destroy'])->name('cart.destroy');
    Route::delete('cart', [CartController::class, 'clear'])->name('cart.clear');
    Route::get('cart/count', [CartController::class, 'count'])->name('cart.count');

    // Payment routes (rate limited)
    Route::prefix('checkout')->middleware('throttle:10,1')->group(function () {
        Route::post('payment-intent', [PaymentController::class, 'createIntent'])->name('checkout.payment-intent');
        Route::post('confirm-payment', [PaymentController::class, 'confirmPayment'])->name('checkout.confirm-payment');
    });
});

// Product routes (auth required)
Route::prefix('v1')->name('api.v1.')->middleware('auth')->group(function () {
    Route::apiResource('products', ProductController::class)->names('products');

    // Product image management
    Route::post('products/{product}/images', [ProductImageController::class, 'store'])->name('products.images.store');
    Route::delete('products/{product}/images/{media}', [ProductImageController::class, 'destroy'])->name('products.images.destroy');
    Route::put('products/{product}/images/{media}/primary', [ProductImageController::class, 'setPrimary'])->name('products.images.primary');
    Route::put('products/{product}/images/reorder', [ProductImageController::class, 'reorder'])->name('products.images.reorder');

    // Address management
    Route::apiResource('addresses', AddressController::class)->names('addresses');
    Route::put('addresses/{address}/set-default', [AddressController::class, 'setDefault'])->name('addresses.set-default');
});
