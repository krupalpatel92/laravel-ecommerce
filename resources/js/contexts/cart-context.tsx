import { apiClient } from '@/lib/api';
import type { Cart, CartContextType } from '@/types/cart.types';
import { createContext, useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export const CartContext = createContext<CartContextType | undefined>(
    undefined,
);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Fetch cart from API
    const fetchCart = useCallback(async () => {
        try {
            const response = await apiClient.get('/cart');
            setCart(response.data.data);
        } catch (err) {
            console.error('Failed to fetch cart:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch cart');
        }
    }, []);

    // Fetch cart on mount
    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
    const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

    const addToCart = useCallback(
        async (
            productId: number,
            variationId?: number,
            quantity: number = 1,
        ) => {
            setLoading(true);
            setError(null);

            try {
                const response = await apiClient.post('/cart/items', {
                    product_id: productId,
                    variation_id: variationId,
                    quantity,
                });

                // Update cart from response instead of fetching again
                if (response.data.cart) {
                    setCart(response.data.cart);
                }

                toast.success('Item added to cart');
                openDrawer();
            } catch (err: any) {
                const message = err.response?.data?.message || 'Failed to add item to cart';
                setError(message);
                toast.error(message);
            } finally {
                setLoading(false);
            }
        },
        [openDrawer],
    );

    const updateQuantity = useCallback(
        async (itemId: number, quantity: number) => {
            // Optimistic update
            const previousCart = cart;
            if (cart) {
                setCart({
                    ...cart,
                    items: cart.items.map((item) =>
                        item.id === itemId ? { ...item, quantity } : item,
                    ),
                });
            }

            try {
                const response = await apiClient.put(`/cart/items/${itemId}`, {
                    quantity,
                });

                // Update cart from response
                if (response.data.cart) {
                    setCart(response.data.cart);
                }

                toast.success('Cart updated');
            } catch (err: any) {
                // Revert optimistic update on error
                setCart(previousCart);
                const message = err.response?.data?.message || 'Failed to update quantity';
                setError(message);
                toast.error(message);
            }
        },
        [cart],
    );

    const removeItem = useCallback(async (itemId: number) => {
        setLoading(true);
        setError(null);

        try {
            await apiClient.delete(`/cart/items/${itemId}`);

            // Refresh cart after removing item
            await fetchCart();
            toast.success('Item removed from cart');
        } catch (err: any) {
            const message = err.response?.data?.message || 'Failed to remove item from cart';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }, [fetchCart]);

    const clearCart = useCallback(async (silent: boolean = false) => {
        setLoading(true);
        setError(null);

        try {
            await apiClient.delete('/cart');

            setCart(null);
            if (!silent) {
                toast.success('Cart cleared');
            }
        } catch (err: any) {
            const message = err.response?.data?.message || 'Failed to clear cart';
            setError(message);
            if (!silent) {
                toast.error(message);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const value: CartContextType = {
        cart,
        loading,
        error,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refetch: fetchCart,
    };

    return (
        <CartContext.Provider value={value}>{children}</CartContext.Provider>
    );
}
