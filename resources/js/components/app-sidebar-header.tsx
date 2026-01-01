import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useCart } from '@/hooks/use-cart';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { ShoppingCart } from 'lucide-react';
import CartDrawer from './cart/cart-drawer';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { cart, openDrawer } = useCart();
    const itemCount = cart?.item_count || 0;

    return (
        <>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
                <div className="flex flex-1 items-center gap-2">
                    <SidebarTrigger className="-ml-1" />
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    onClick={openDrawer}
                >
                    <ShoppingCart className="size-5" />
                    {itemCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                            {itemCount > 9 ? '9+' : itemCount}
                        </span>
                    )}
                </Button>
            </header>

            <CartDrawer />
        </>
    );
}
