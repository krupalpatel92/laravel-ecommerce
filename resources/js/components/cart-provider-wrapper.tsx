import { CartProvider } from '@/contexts/cart-context';
import { usePage } from '@inertiajs/react';
import { useEffect, type ReactNode } from 'react';
import { toast } from 'sonner';

export function CartProviderWrapper({ children }: { children: ReactNode }) {
    const { props } = usePage();

    useEffect(() => {
        const flash = props.flash as { cart_merged?: string } | undefined;
        if (flash?.cart_merged) {
            toast.success(flash.cart_merged);
        }
    }, [props.flash]);

    return <CartProvider>{children}</CartProvider>;
}
