import { Product } from '@/types/product.types';
import { ProductCard } from './product-card';

interface ProductGridProps {
    products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
    if (products.length === 0) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900">No products found</h3>
                    <p className="mt-2 text-sm text-gray-600">
                        Try adjusting your search or filters to find what you're looking for.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}
