import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { ProductGrid } from '@/components/products/product-grid';
// import { ProductSearch } from '@/components/products/product-search';
// import { ProductFilters } from '@/components/products/product-filters';
import { Product } from '@/types/product.types';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { router } from '@inertiajs/react';

interface ProductsPageProps {
    products?: {
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

export default function ProductsIndex({ products: initialProducts }: ProductsPageProps) {
    const [products, setProducts] = useState<ProductsPageProps['products']>(initialProducts);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!products) {
            setLoading(true);
            fetch('/api/v1/public/products')
                .then((res) => res.json())
                .then((data) => {
                    setProducts(data);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }
    }, [products]);

    const urlParams = new URLSearchParams(window.location.search);
    const filters = {
        search: urlParams.get('search') || undefined,
        category: urlParams.get('category') || undefined,
        min_price: urlParams.get('min_price') || undefined,
        max_price: urlParams.get('max_price') || undefined,
        in_stock: urlParams.get('in_stock') === 'true',
        sort: urlParams.get('sort') || undefined,
    };

    const goToPage = (page: number) => {
        router.get(
            '/products',
            { ...Object.fromEntries(urlParams), page },
            {
                preserveState: true,
                preserveScroll: false,
            }
        );
    };

    if (loading || !products) {
        return (
            <AppLayout>
                <Head title="Products" />
                <div className="flex min-h-[400px] items-center justify-center">
                    <div className="text-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900"></div>
                        <p className="mt-4 text-sm text-gray-600">Loading products...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title="Products" />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Products</h1>
                    <p className="mt-2 text-gray-600">
                        Browse our collection of {products.meta.total} products
                    </p>
                </div>

                {/* Search and Filters disabled temporarily - will be fixed in future */}
                {/* <div className="mb-6">
                    <ProductSearch initialValue={filters.search} />
                </div> */}

                {/* <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                    <aside className="lg:col-span-1">
                        <ProductFilters filters={filters} />
                    </aside>

                    <main className="lg:col-span-3"> */}
                        <ProductGrid products={products.data} />

                        {products.meta.last_page > 1 && (
                            <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
                                <div className="flex flex-1 justify-between sm:hidden">
                                    <Button
                                        variant="outline"
                                        onClick={() => goToPage(products.meta.current_page - 1)}
                                        disabled={!products.links.prev}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => goToPage(products.meta.current_page + 1)}
                                        disabled={!products.links.next}
                                    >
                                        Next
                                    </Button>
                                </div>
                                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            Showing{' '}
                                            <span className="font-medium">
                                                {(products.meta.current_page - 1) * products.meta.per_page + 1}
                                            </span>{' '}
                                            to{' '}
                                            <span className="font-medium">
                                                {Math.min(
                                                    products.meta.current_page * products.meta.per_page,
                                                    products.meta.total
                                                )}
                                            </span>{' '}
                                            of <span className="font-medium">{products.meta.total}</span> results
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => goToPage(products.meta.current_page - 1)}
                                            disabled={!products.links.prev}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => goToPage(products.meta.current_page + 1)}
                                            disabled={!products.links.next}
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    {/* </main>
                </div> */}
            </div>
        </AppLayout>
    );
}
