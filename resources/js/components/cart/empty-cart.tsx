import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function EmptyCart() {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-muted p-6">
                <ShoppingBag className="size-12 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Your cart is empty</h3>
            <p className="mb-6 text-sm text-muted-foreground">
                Add items to your cart to get started
            </p>
            <Button asChild>
                <Link href="/products">Continue Shopping</Link>
            </Button>
        </div>
    );
}
