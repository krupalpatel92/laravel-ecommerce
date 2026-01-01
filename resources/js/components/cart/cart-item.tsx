import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import type { CartItem as CartItemType } from '@/types/cart.types';
import { AlertTriangle, Minus, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Props {
    item: CartItemType;
}

export default function CartItem({ item }: Props) {
    const { updateQuantity, removeItem } = useCart();
    const [isUpdating, setIsUpdating] = useState(false);

    const handleUpdateQuantity = async (newQuantity: number) => {
        if (newQuantity < 1 || isUpdating) return;

        setIsUpdating(true);
        try {
            await updateQuantity(item.id, newQuantity);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleRemove = async () => {
        if (isUpdating) return;

        setIsUpdating(true);
        try {
            await removeItem(item.id);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex gap-4">
                {item.product.primary_image_thumb_url ? (
                    <img
                        src={item.product.primary_image_thumb_url}
                        alt={item.product.name}
                        className="size-20 rounded-md object-cover"
                    />
                ) : (
                    <div className="flex size-20 items-center justify-center rounded-md bg-muted">
                        <span className="text-xs text-muted-foreground">
                            No image
                        </span>
                    </div>
                )}

                <div className="flex flex-1 flex-col justify-between">
                    <div>
                        <h4 className="font-medium">{item.product.name}</h4>
                        {item.variation && (
                            <p className="text-sm text-muted-foreground">
                                {item.variation.name}
                            </p>
                        )}
                        <p className="mt-1 text-sm font-semibold">
                            ${parseFloat(item.price).toFixed(2)}
                        </p>
                    </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="size-8"
                            onClick={() =>
                                handleUpdateQuantity(item.quantity - 1)
                            }
                            disabled={isUpdating || item.quantity <= 1}
                        >
                            <Minus className="size-4" />
                        </Button>

                        <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                        </span>

                        <Button
                            variant="outline"
                            size="icon"
                            className="size-8"
                            onClick={() =>
                                handleUpdateQuantity(item.quantity + 1)
                            }
                            disabled={
                                isUpdating ||
                                item.quantity >= item.available_stock
                            }
                        >
                            <Plus className="size-4" />
                        </Button>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={handleRemove}
                        disabled={isUpdating}
                    >
                        <Trash2 className="size-4 text-destructive" />
                    </Button>
                </div>
            </div>
        </div>

        {item.is_out_of_stock && (
            <Alert variant="destructive">
                <AlertTriangle className="size-4" />
                <AlertDescription>
                    This item is currently out of stock and may be removed from
                    your cart.
                </AlertDescription>
            </Alert>
        )}

        {item.is_low_stock && !item.is_out_of_stock && (
            <Alert variant="default" className="border-orange-500">
                <AlertTriangle className="size-4 text-orange-500" />
                <AlertDescription>
                    Only {item.available_stock} left in stock. Order soon!
                </AlertDescription>
            </Alert>
        )}
        </div>
    );
}
