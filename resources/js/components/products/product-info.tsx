import { useState } from 'react';
import { ProductDetail, ProductVariation } from '@/types/product.types';
import { StockBadge } from './stock-badge';
import { VariationSelector } from './variation-selector';
import { QuantitySelector } from './quantity-selector';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProductInfoProps {
    product: ProductDetail;
}

export function ProductInfo({ product }: ProductInfoProps) {
    const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(
        product.variations?.[0] || null
    );
    const [quantity, setQuantity] = useState(1);
    const { addToCart, loading } = useCart();

    const isVariable = product.type === 'variable';
    const currentStock = isVariable
        ? selectedVariation?.stock_quantity || 0
        : product.stock_quantity;
    const isInStock = currentStock > 0;
    const displayPrice = isVariable && selectedVariation
        ? parseFloat(selectedVariation.price).toFixed(2)
        : product.price
            ? parseFloat(product.price).toFixed(2)
            : '0.00';

    const handleAddToCart = () => {
        addToCart(product.id, selectedVariation?.id, quantity);
    };

    const canAddToCart = isVariable ? isInStock && selectedVariation : isInStock;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                {product.categories.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {product.categories.map((category) => (
                            <Badge key={category.id} variant="secondary">
                                {category.parent && `${category.parent.name} / `}
                                {category.name}
                            </Badge>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-gray-900">${displayPrice}</span>
                <StockBadge
                    stockStatus={isInStock ? 'in_stock' : 'out_of_stock'}
                    stockQuantity={currentStock}
                />
            </div>

            {product.sku && !isVariable && (
                <div className="text-sm text-gray-600">
                    <span className="font-medium">SKU:</span> {product.sku}
                </div>
            )}

            {product.description && (
                <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700">{product.description}</p>
                </div>
            )}

            {isVariable && product.variations && product.variations.length > 0 && (
                <VariationSelector
                    variations={product.variations}
                    selectedVariation={selectedVariation}
                    onSelect={setSelectedVariation}
                />
            )}

            {isInStock && (
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Quantity</label>
                    <QuantitySelector
                        quantity={quantity}
                        max={Math.min(currentStock, 99)}
                        onChange={setQuantity}
                    />
                </div>
            )}

            <div className="flex gap-4">
                <Button
                    size="lg"
                    className="flex-1"
                    onClick={handleAddToCart}
                    disabled={!canAddToCart || loading}
                >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    {loading ? 'Adding...' : 'Add to Cart'}
                </Button>
            </div>

            {!isInStock && (
                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
                    This product is currently out of stock. Please check back later.
                </div>
            )}

            {isVariable && !selectedVariation && (
                <div className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
                    Please select a variation to add this product to your cart.
                </div>
            )}
        </div>
    );
}
