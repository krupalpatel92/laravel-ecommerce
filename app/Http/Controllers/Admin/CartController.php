<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    /**
     * Display a listing of carts
     */
    public function index(Request $request): Response
    {
        $query = Cart::query()
            ->with(['user', 'items'])
            ->withCount('items')
            ->latest();

        // Filter by type (guest/user)
        if ($request->filled('type')) {
            if ($request->type === 'guest') {
                $query->whereNull('user_id');
            } elseif ($request->type === 'user') {
                $query->whereNotNull('user_id');
            }
        }

        // Filter by status (active/expired)
        if ($request->filled('status')) {
            if ($request->status === 'expired') {
                $query->expired();
            } elseif ($request->status === 'active') {
                $query->where(function ($q) {
                    $q->whereNull('expires_at')
                        ->orWhere('expires_at', '>', now());
                });
            }
        }

        $carts = $query->paginate(20)->withQueryString();

        return Inertia::render('admin/carts/index', [
            'carts' => $carts,
            'filters' => $request->only(['type', 'status']),
        ]);
    }

    /**
     * Display the specified cart
     */
    public function show(Cart $cart): Response
    {
        $cart->load([
            'user',
            'items.product.media',
            'items.variation',
        ]);

        return Inertia::render('admin/carts/show', [
            'cart' => [
                'id' => $cart->id,
                'user_id' => $cart->user_id,
                'session_id' => $cart->session_id,
                'user' => $cart->user ? [
                    'id' => $cart->user->id,
                    'name' => $cart->user->name,
                    'email' => $cart->user->email,
                ] : null,
                'items' => $cart->items->map(fn ($item) => [
                    'id' => $item->id,
                    'product' => [
                        'id' => $item->product->id,
                        'name' => $item->product->name,
                        'slug' => $item->product->slug,
                        'primary_image_thumb_url' => $item->product->getPrimaryImageUrl('thumb'),
                    ],
                    'variation' => $item->variation ? [
                        'id' => $item->variation->id,
                        'name' => $item->variation->name,
                        'sku' => $item->variation->sku,
                    ] : null,
                    'quantity' => $item->quantity,
                    'price' => $item->price,
                    'subtotal' => $item->getSubtotal(),
                ]),
                'item_count' => $cart->getItemCount(),
                'total' => $cart->getTotal(),
                'expires_at' => $cart->expires_at?->toIso8601String(),
                'is_expired' => $cart->isExpired(),
                'created_at' => $cart->created_at->toIso8601String(),
                'updated_at' => $cart->updated_at->toIso8601String(),
            ],
        ]);
    }

    /**
     * Remove the specified cart
     */
    public function destroy(Cart $cart)
    {
        $cart->items()->delete();
        $cart->delete();

        return redirect()->route('admin.carts.index')
            ->with('success', 'Cart deleted successfully');
    }
}
