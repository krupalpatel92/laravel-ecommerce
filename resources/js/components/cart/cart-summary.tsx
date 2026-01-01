import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/use-cart';

interface Props {
    showCheckoutButton?: boolean;
    onCheckout?: () => void;
}

export default function CartSummary({
    showCheckoutButton = true,
    onCheckout,
}: Props) {
    const { cart } = useCart();

    if (!cart || cart.items.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                        Subtotal ({cart.item_count}{' '}
                        {cart.item_count === 1 ? 'item' : 'items'})
                    </span>
                    <span className="font-medium">
                        ${cart.total.toFixed(2)}
                    </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-sm text-muted-foreground">
                        Calculated at checkout
                    </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="text-sm text-muted-foreground">
                        Calculated at checkout
                    </span>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="text-lg font-bold">
                        ${cart.total.toFixed(2)}
                    </span>
                </div>
            </div>

            {showCheckoutButton && (
                <Button
                    onClick={onCheckout}
                    className="w-full"
                    size="lg"
                >
                    Proceed to Checkout
                </Button>
            )}
        </div>
    );
}
