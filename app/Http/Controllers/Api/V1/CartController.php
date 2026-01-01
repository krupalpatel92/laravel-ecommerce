<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Actions\Cart\AddToCartAction;
use App\Actions\Cart\ClearCartAction;
use App\Actions\Cart\GetOrCreateCartAction;
use App\Actions\Cart\RemoveFromCartAction;
use App\Actions\Cart\UpdateCartItemAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\AddToCartRequest;
use App\Http\Requests\UpdateCartItemRequest;
use App\Http\Resources\CartItemResource;
use App\Http\Resources\CartResource;
use App\Models\CartItem;
use App\Services\CartService;
use Exception;
use Illuminate\Http\JsonResponse;

class CartController extends Controller
{
    public function __construct(
        private readonly CartService $cartService,
        private readonly GetOrCreateCartAction $getOrCreateCartAction
    ) {}

    /**
     * @OA\Get(
     *     path="/api/v1/cart",
     *     summary="Get current cart",
     *     description="Get the current user's or guest's shopping cart",
     *     tags={"Cart"},
     *
     *     @OA\Response(
     *         response=200,
     *         description="Cart retrieved successfully",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="data", ref="#/components/schemas/Cart", nullable=true)
     *         )
     *     )
     * )
     */
    public function index(): JsonResponse
    {
        $cart = $this->cartService->getCurrentCart();

        return response()->json([
            'data' => $cart ? new CartResource($cart) : null,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/cart/items",
     *     summary="Add item to cart",
     *     description="Add a product or product variation to the shopping cart",
     *     tags={"Cart"},
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *             required={"product_id", "quantity"},
     *
     *             @OA\Property(property="product_id", type="integer", example=5),
     *             @OA\Property(property="variation_id", type="integer", nullable=true, example=3),
     *             @OA\Property(property="quantity", type="integer", example=2, minimum=1, maximum=99)
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=201,
     *         description="Item added to cart successfully",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="data", ref="#/components/schemas/CartItem"),
     *             @OA\Property(property="message", type="string", example="Item added to cart")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=400,
     *         description="Business logic error (out of stock, product unavailable, etc.)",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="message", type="string")
     *         )
     *     )
     * )
     */
    public function store(AddToCartRequest $request, AddToCartAction $action): JsonResponse
    {
        try {
            // Get or create cart
            $userId = auth()->id();
            $sessionId = $userId ? null : $this->cartService->getOrCreateSessionId();

            $cart = $this->getOrCreateCartAction->execute($userId, $sessionId);

            // Add item to cart
            $cartItem = $action->execute(
                $cart,
                $request->integer('product_id'),
                $request->filled('variation_id') ? $request->integer('variation_id') : null,
                $request->integer('quantity', 1)
            );

            // Refresh cart with all items
            $cart->load(['items.product.media', 'items.variation']);

            return response()->json([
                'data' => new CartItemResource($cartItem),
                'cart' => new CartResource($cart),
                'message' => 'Item added to cart',
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/v1/cart/items/{cartItem}",
     *     summary="Update cart item quantity",
     *     description="Update the quantity of a cart item. Set to 0 to remove the item.",
     *     tags={"Cart"},
     *
     *     @OA\Parameter(
     *         name="cartItem",
     *         in="path",
     *         required=true,
     *         description="Cart item ID",
     *
     *         @OA\Schema(type="integer")
     *     ),
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *             required={"quantity"},
     *
     *             @OA\Property(property="quantity", type="integer", example=5, minimum=0, maximum=99)
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Cart item updated successfully",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="data", ref="#/components/schemas/CartItem", nullable=true),
     *             @OA\Property(property="message", type="string", example="Cart updated")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=404,
     *         description="Cart item not found or access denied",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="message", type="string", example="Cart item not found")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=400,
     *         description="Business logic error (insufficient stock)",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="message", type="string")
     *         )
     *     )
     * )
     */
    public function update(
        CartItem $cartItem,
        UpdateCartItemRequest $request,
        UpdateCartItemAction $action
    ): JsonResponse {
        // Verify ownership
        if (! $this->canAccessCartItem($cartItem)) {
            return response()->json(['message' => 'Cart item not found'], 404);
        }

        try {
            $updatedItem = $action->execute($cartItem, $request->integer('quantity'));

            // Refresh cart with all items
            $cart = $cartItem->cart->load(['items.product.media', 'items.variation']);

            if (! $updatedItem) {
                return response()->json([
                    'data' => null,
                    'cart' => new CartResource($cart),
                    'message' => 'Item removed from cart',
                ]);
            }

            return response()->json([
                'data' => new CartItemResource($updatedItem),
                'cart' => new CartResource($cart),
                'message' => 'Cart updated',
            ]);
        } catch (Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/cart/items/{cartItem}",
     *     summary="Remove item from cart",
     *     description="Remove a specific item from the shopping cart",
     *     tags={"Cart"},
     *
     *     @OA\Parameter(
     *         name="cartItem",
     *         in="path",
     *         required=true,
     *         description="Cart item ID",
     *
     *         @OA\Schema(type="integer")
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Item removed successfully",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="data", type="null"),
     *             @OA\Property(property="message", type="string", example="Item removed from cart")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=404,
     *         description="Cart item not found or access denied",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="message", type="string", example="Cart item not found")
     *         )
     *     )
     * )
     */
    public function destroy(CartItem $cartItem, RemoveFromCartAction $action): JsonResponse
    {
        // Verify ownership
        if (! $this->canAccessCartItem($cartItem)) {
            return response()->json(['message' => 'Cart item not found'], 404);
        }

        $action->execute($cartItem);

        return response()->json([
            'data' => null,
            'message' => 'Item removed from cart',
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/cart",
     *     summary="Clear entire cart",
     *     description="Remove all items from the shopping cart",
     *     tags={"Cart"},
     *
     *     @OA\Response(
     *         response=200,
     *         description="Cart cleared successfully",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="data", type="null"),
     *             @OA\Property(property="message", type="string", example="Cart cleared")
     *         )
     *     )
     * )
     */
    public function clear(ClearCartAction $action): JsonResponse
    {
        $cart = $this->cartService->getCurrentCart();

        if ($cart) {
            $action->execute($cart);
        }

        return response()->json([
            'data' => null,
            'message' => 'Cart cleared',
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/cart/count",
     *     summary="Get cart item count",
     *     description="Get the total number of items in the cart (for header badge)",
     *     tags={"Cart"},
     *
     *     @OA\Response(
     *         response=200,
     *         description="Cart count retrieved successfully",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="count", type="integer", example=5)
     *         )
     *     )
     * )
     */
    public function count(): JsonResponse
    {
        $cart = $this->cartService->getCurrentCart();

        return response()->json([
            'count' => $cart ? $cart->getItemCount() : 0,
        ]);
    }

    /**
     * Check if current user/guest can access the cart item
     */
    private function canAccessCartItem(CartItem $cartItem): bool
    {
        $cart = $cartItem->cart;

        if (auth()->check()) {
            return $cart->user_id === auth()->id();
        }

        $sessionId = $this->cartService->getSessionId();

        return $sessionId && $cart->session_id === $sessionId;
    }
}
