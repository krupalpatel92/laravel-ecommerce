import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { destroy as cartsDestroy, index as cartsIndex } from '@/routes/admin/carts';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { format, formatDistanceToNow } from 'date-fns';
import { ArrowLeft, Calendar, Clock, ShoppingCart, Trash2, User } from 'lucide-react';

interface CartItem {
    id: number;
    product: {
        id: number;
        name: string;
        slug: string;
        primary_image_thumb_url: string | null;
    };
    variation: {
        id: number;
        name: string;
        sku: string;
    } | null;
    quantity: number;
    price: string;
    subtotal: number;
}

interface Cart {
    id: number;
    user_id: number | null;
    session_id: string | null;
    user: {
        id: number;
        name: string;
        email: string;
    } | null;
    items: CartItem[];
    item_count: number;
    total: number;
    expires_at: string | null;
    is_expired: boolean;
    created_at: string;
    updated_at: string;
}

interface Props {
    cart: Cart;
}

export default function AdminCartsShow({ cart }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Users Carts',
            href: cartsIndex().url,
        },
        {
            title: `Cart #${cart.id}`,
        },
    ];

    const handleDelete = () => {
        if (
            confirm(
                'Are you sure you want to delete this cart? This action cannot be undone.',
            )
        ) {
            router.delete(cartsDestroy.url(cart.id), {
                onSuccess: () => router.visit(cartsIndex.url()),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Cart #${cart.id}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={cartsIndex.url()}>
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="size-4" />
                            </Button>
                        </Link>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">
                                Cart #{cart.id}
                            </h2>
                            <p className="text-muted-foreground">
                                {cart.item_count}{' '}
                                {cart.item_count === 1 ? 'item' : 'items'} •
                                Total: ${cart.total.toFixed(2)}
                            </p>
                        </div>
                    </div>

                    <Button variant="destructive" onClick={handleDelete}>
                        <Trash2 className="mr-2 size-4" />
                        Delete Cart
                    </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <div className="rounded-lg border bg-card">
                            <div className="border-b p-6">
                                <h2 className="font-semibold">Cart Items</h2>
                            </div>

                            {cart.items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <ShoppingCart className="mb-4 size-12 text-muted-foreground" />
                                    <p className="text-muted-foreground">
                                        No items in this cart
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {cart.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex gap-4 p-6"
                                        >
                                            {item.product
                                                .primary_image_thumb_url ? (
                                                <img
                                                    src={
                                                        item.product
                                                            .primary_image_thumb_url
                                                    }
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
                                                    <h4 className="font-medium">
                                                        {item.product.name}
                                                    </h4>
                                                    {item.variation && (
                                                        <p className="text-sm text-muted-foreground">
                                                            {item.variation.name}
                                                        </p>
                                                    )}
                                                    <p className="mt-1 text-sm font-semibold">
                                                        $
                                                        {parseFloat(
                                                            item.price,
                                                        ).toFixed(2)}{' '}
                                                        × {item.quantity}
                                                    </p>
                                                </div>

                                                <div className="text-right">
                                                    <p className="font-semibold">
                                                        $
                                                        {item.subtotal.toFixed(
                                                            2,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-lg border bg-card p-6">
                            <h2 className="mb-4 font-semibold">
                                Cart Information
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Cart Type
                                    </p>
                                    <p className="mt-1 flex items-center gap-2">
                                        {cart.user_id ? (
                                            <>
                                                <User className="size-4" />
                                                User Cart
                                            </>
                                        ) : (
                                            <>
                                                <ShoppingCart className="size-4" />
                                                Guest Cart
                                            </>
                                        )}
                                    </p>
                                </div>

                                {cart.user && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Customer
                                        </p>
                                        <p className="mt-1 font-medium">
                                            {cart.user.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {cart.user.email}
                                        </p>
                                    </div>
                                )}

                                {cart.session_id && !cart.user_id && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Session ID
                                        </p>
                                        <p className="mt-1 font-mono text-xs">
                                            {cart.session_id}
                                        </p>
                                    </div>
                                )}

                                <Separator />

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Status
                                    </p>
                                    <p className="mt-1">
                                        {cart.is_expired ? (
                                            <span className="inline-flex items-center rounded-full border border-destructive bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive">
                                                Expired
                                            </span>
                                        ) : cart.expires_at ? (
                                            <span className="inline-flex items-center rounded-full border border-orange-500 bg-orange-500/10 px-2.5 py-0.5 text-xs font-semibold text-orange-500">
                                                Expires{' '}
                                                {formatDistanceToNow(
                                                    new Date(cart.expires_at),
                                                    { addSuffix: true },
                                                )}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center rounded-full border border-green-500 bg-green-500/10 px-2.5 py-0.5 text-xs font-semibold text-green-500">
                                                Active
                                            </span>
                                        )}
                                    </p>
                                </div>

                                {cart.expires_at && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Expires At
                                        </p>
                                        <p className="mt-1 flex items-center gap-2">
                                            <Clock className="size-4" />
                                            {format(
                                                new Date(cart.expires_at),
                                                'PPpp',
                                            )}
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Created At
                                    </p>
                                    <p className="mt-1 flex items-center gap-2">
                                        <Calendar className="size-4" />
                                        {format(
                                            new Date(cart.created_at),
                                            'PPpp',
                                        )}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Last Updated
                                    </p>
                                    <p className="mt-1 flex items-center gap-2">
                                        <Calendar className="size-4" />
                                        {format(
                                            new Date(cart.updated_at),
                                            'PPpp',
                                        )}
                                    </p>
                                </div>

                                <Separator />

                                <div>
                                    <div className="flex items-center justify-between text-lg font-semibold">
                                        <span>Total</span>
                                        <span>${cart.total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
