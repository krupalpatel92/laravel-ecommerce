import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { ShoppingCart } from 'lucide-react';
import { useState } from 'react';

interface Props {
    productId: number;
    variationId?: number;
    quantity?: number;
    disabled?: boolean;
    size?: 'sm' | 'default' | 'lg';
    variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive';
    className?: string;
}

export default function AddToCartButton({
    productId,
    variationId,
    quantity = 1,
    disabled = false,
    size = 'default',
    variant = 'default',
    className,
}: Props) {
    const { addToCart, loading } = useCart();
    const [isAdding, setIsAdding] = useState(false);

    const handleClick = async () => {
        setIsAdding(true);
        try {
            await addToCart(productId, variationId, quantity);
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <Button
            onClick={handleClick}
            disabled={disabled || loading || isAdding}
            size={size}
            variant={variant}
            className={className}
        >
            <ShoppingCart className="mr-2 size-4" />
            {isAdding ? 'Adding...' : 'Add to Cart'}
        </Button>
    );
}
