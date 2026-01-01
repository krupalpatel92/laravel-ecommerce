import ProductCard from '@/components/admin/products/product-card';
import ProductCardSkeleton from '@/components/admin/products/product-card-skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { index as productsIndexRoute, create as createProductRoute } from '@/routes/admin/products';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Products',
        href: productsIndexRoute().url,
    },
];

interface Category {
    id: number;
    name: string;
    slug: string;
    parent_id?: number | null;
    parent?: {
        id: number;
        name: string;
    };
}

interface Variation {
    id: number;
    price: number | string;
}

interface Product {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    type: 'single' | 'variable';
    price: number | string;
    stock_quantity: number;
    alert_threshold: number;
    status: 'draft' | 'published' | 'archived';
    is_low_stock: boolean;
    is_out_of_stock: boolean;
    created_at: string;
    updated_at: string;
    categories?: Category[];
    variations?: Variation[];
    primary_image_url?: string | null;
    primary_image_thumb_url?: string | null;
    primary_image_medium_url?: string | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface ProductsData {
    data: Product[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: PaginationLink[];
}

interface Props {
    products: ProductsData;
    filters?: {
        search?: string;
        status?: string;
        type?: string;
        page?: number;
    };
}

export default function ProductsIndex({ products, filters }: Props) {
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || '');
    const [type, setType] = useState(filters?.type || '');
    const [isFiltering, setIsFiltering] = useState(false);

    const handleFilter = () => {
        setIsFiltering(true);
        router.get(
            productsIndexRoute().url,
            {
                search: search || undefined,
                status: status || undefined,
                type: type || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsFiltering(false),
            },
        );
    };

    const handleClearFilters = () => {
        setSearch('');
        setStatus('');
        setType('');
        router.get(productsIndexRoute().url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Products</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage your product catalog
                        </p>
                    </div>
                    <Link href={createProductRoute().url}>
                        <Button>
                            <Plus className="mr-2 size-4" />
                            Add Product
                        </Button>
                    </Link>
                </div>

                <div className="flex flex-col gap-4 rounded-xl border border-sidebar-border/70 bg-card p-4 dark:border-sidebar-border">
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="md:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search products..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleFilter();
                                        }
                                    }}
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <Select
                            value={status || 'all'}
                            onValueChange={(value) =>
                                setStatus(value === 'all' ? '' : value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All statuses</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="published">
                                    Published
                                </SelectItem>
                                <SelectItem value="archived">
                                    Archived
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={type || 'all'}
                            onValueChange={(value) =>
                                setType(value === 'all' ? '' : value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All types</SelectItem>
                                <SelectItem value="single">Single</SelectItem>
                                <SelectItem value="variable">
                                    Variable
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex gap-2">
                        <Button onClick={handleFilter} size="sm">
                            Apply Filters
                        </Button>
                        <Button
                            onClick={handleClearFilters}
                            variant="outline"
                            size="sm"
                        >
                            Clear
                        </Button>
                    </div>
                </div>

                {isFiltering ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <ProductCardSkeleton key={index} />
                        ))}
                    </div>
                ) : products.data.length === 0 ? (
                    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-sidebar-border/70 p-8 text-center">
                        <h3 className="text-lg font-semibold">
                            No products found
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Get started by creating your first product.
                        </p>
                        <Link href={createProductRoute().url} className="mt-4">
                            <Button>
                                <Plus className="mr-2 size-4" />
                                Add Product
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {products.data.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                />
                            ))}
                        </div>

                        {products.last_page > 1 && (
                            <div className="flex items-center justify-center gap-2">
                                {products.links.map((link, index) => (
                                    <Button
                                        key={index}
                                        variant={
                                            link.active ? 'default' : 'outline'
                                        }
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => {
                                            if (link.url) {
                                                router.get(link.url);
                                            }
                                        }}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </AppLayout>
    );
}
