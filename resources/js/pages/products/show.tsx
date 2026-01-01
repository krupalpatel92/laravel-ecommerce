import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { ProductDetail } from '@/types/product.types';
import { ProductGallery } from '@/components/products/product-gallery';
import { ProductInfo } from '@/components/products/product-info';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { index } from '@/routes/products';

interface ProductShowProps {
    slug: string;
}

export default function ProductShow({ slug }: ProductShowProps) {
    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/v1/public/products/${slug}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Product not found');
                }
                return res.json();
            })
            .then((data) => {
                setProduct(data.data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, [slug]);

    if (loading) {
        return (
            <AppLayout>
                <Head title="Loading..." />
                <div className="flex min-h-[400px] items-center justify-center">
                    <div className="text-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900"></div>
                        <p className="mt-4 text-sm text-gray-600">Loading product...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    if (error || !product) {
        return (
            <AppLayout>
                <Head title="Product Not Found" />
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="flex min-h-[400px] flex-col items-center justify-center">
                        <h2 className="text-2xl font-bold text-gray-900">Product Not Found</h2>
                        <p className="mt-2 text-gray-600">
                            The product you're looking for doesn't exist or has been removed.
                        </p>
                        <Link href={index.url()}>
                            <Button className="mt-6">
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Back to Products
                            </Button>
                        </Link>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title={product.name} />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <Link href={index.url()}>
                        <Button variant="ghost" size="sm">
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back to Products
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    <div>
                        <ProductGallery images={product.images || []} productName={product.name} />
                    </div>
                    <div>
                        <ProductInfo product={product} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
