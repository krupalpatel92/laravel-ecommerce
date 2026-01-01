export interface CartProduct {
    id: number;
    name: string;
    slug: string;
    type: 'single' | 'variable';
    primary_image_thumb_url: string | null;
}

export interface CartVariation {
    id: number;
    name: string;
    sku: string;
    attributes: Record<string, string>;
}

export interface CartItem {
    id: number;
    product: CartProduct;
    variation: CartVariation | null;
    quantity: number;
    price: string;
    subtotal: number;
    available_stock: number;
    is_out_of_stock: boolean;
    is_low_stock: boolean;
}

export interface Cart {
    id: number;
    user_id: number | null;
    session_id: string | null;
    items: CartItem[];
    item_count: number;
    total: number;
    expires_at: string | null;
}

export interface CartContextType {
    cart: Cart | null;
    loading: boolean;
    error: string | null;
    isDrawerOpen: boolean;
    openDrawer: () => void;
    closeDrawer: () => void;
    addToCart: (productId: number, variationId?: number, quantity?: number) => Promise<void>;
    updateQuantity: (itemId: number, quantity: number) => Promise<void>;
    removeItem: (itemId: number) => Promise<void>;
    clearCart: (silent?: boolean) => Promise<void>;
    refetch: () => Promise<void>;
}
