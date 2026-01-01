export interface ProductCategory {
    id: number;
    name: string;
    slug: string;
    parent?: {
        id: number;
        name: string;
        slug: string;
    } | null;
}

export interface ProductImage {
    id: number;
    url: string;
    thumb_url: string;
    is_primary: boolean;
}

export interface ProductVariation {
    id: number;
    name: string;
    sku: string;
    price: string;
    stock_quantity: number;
    attributes: Record<string, string>;
}

export interface Product {
    id: number;
    name: string;
    slug: string;
    description: string;
    type: 'single' | 'variable';
    price?: string;
    price_range?: {
        min: string;
        max: string;
    };
    stock_quantity: number;
    stock_status: 'in_stock' | 'out_of_stock';
    primary_image_url: string | null;
    categories: ProductCategory[];
}

export interface ProductDetail extends Omit<Product, 'primary_image_url'> {
    sku?: string;
    alert_threshold: number;
    images: ProductImage[];
    variations: ProductVariation[];
}

export interface ProductsIndexProps {
    products: {
        data: Product[];
        meta: {
            current_page: number;
            per_page: number;
            total: number;
            last_page: number;
        };
        links: {
            first: string | null;
            last: string | null;
            prev: string | null;
            next: string | null;
        };
    };
}

export interface ProductShowProps {
    slug: string;
}
