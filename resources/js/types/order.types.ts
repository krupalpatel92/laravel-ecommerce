import { Product } from './product.types';

export interface OrderAddress {
    id: number;
    order_id: number;
    type: 'shipping' | 'billing';
    first_name: string;
    last_name: string;
    address_line1: string;
    address_line2?: string | null;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone: string;
    created_at: string;
    updated_at: string;
}

export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    variation_id?: number | null;
    quantity: number;
    price: string;
    product?: Product;
    variation?: {
        id: number;
        name: string;
        sku: string;
        price: string;
        attributes: Record<string, string>;
    };
    created_at: string;
    updated_at: string;
}

export interface Order {
    id: number;
    user_id?: number | null;
    order_number: string;
    total: string;
    status: 'pending' | 'processing' | 'completed' | 'cancelled';
    payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
    stripe_payment_intent_id?: string | null;
    user?: {
        id: number;
        name: string;
        email: string;
    };
    items?: OrderItem[];
    addresses?: OrderAddress[];
    created_at: string;
    updated_at: string;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface OrdersData {
    data: Order[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: PaginationLink[];
}
