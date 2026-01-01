import { Link } from '@inertiajs/react';
import { show } from '@/routes/products';
import { Product } from '@/types/product.types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { StockBadge } from './stock-badge';
import AddToCartButton from '@/components/cart/add-to-cart-button';
import { Package } from 'lucide-react';

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const displayPrice = product.type === 'single' && product.price
        ? `$${parseFloat(product.price).toFixed(2)}`
        : product.price_range
            ? `$${parseFloat(product.price_range.min).toFixed(2)} - $${parseFloat(product.price_range.max).toFixed(2)}`
            : 'Price not available';

    return (
        <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
            <Link href={show.url(product.slug)} className="block">
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                    {product.primary_image_url ? (
                        <img
                            src={product.primary_image_url}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <Package className="h-16 w-16 text-gray-400" />
                        </div>
                    )}
                    <div className="absolute right-2 top-2">
                        <StockBadge stockStatus={product.stock_status} stockQuantity={product.stock_quantity} />
                    </div>
                </div>
                <CardContent className="p-4">
                    <h3 className="line-clamp-2 font-semibold text-gray-900">{product.name}</h3>
                    {product.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-gray-600">{product.description}</p>
                    )}
                    {product.categories.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                            {product.categories.slice(0, 2).map((category) => (
                                <span
                                    key={category.id}
                                    className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
                                >
                                    {category.name}
                                </span>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Link>
            <CardFooter className="flex items-center justify-between p-4 pt-0">
                <span className="text-lg font-bold text-gray-900">{displayPrice}</span>
                {product.type === 'single' && product.stock_status === 'in_stock' && (
                    <AddToCartButton productId={product.id} />
                )}
            </CardFooter>
        </Card>
    );
}
