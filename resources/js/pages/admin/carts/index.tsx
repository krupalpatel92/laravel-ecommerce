import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { destroy as cartsDestroy, index as cartsIndex, show as cartsShow } from '@/routes/admin/carts';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import { Eye, ShoppingCart, Trash2, User } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users Carts',
        href: cartsIndex().url,
    },
];

interface Cart {
    id: number;
    user_id: number | null;
    session_id: string | null;
    user: {
        id: number;
        name: string;
        email: string;
    } | null;
    items_count: number;
    expires_at: string | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    carts: {
        data: Cart[];
        links: any;
        meta: any;
    };
    filters: {
        type?: string;
        status?: string;
    };
}

export default function AdminCartsIndex({ carts, filters }: Props) {
    const handleFilterChange = (key: string, value: string) => {
        router.get(
            cartsIndex.url(),
            { ...filters, [key]: value },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleDelete = (cartId: number) => {
        if (
            confirm(
                'Are you sure you want to delete this cart? This action cannot be undone.',
            )
        ) {
            router.delete(cartsDestroy.url(cartId));
        }
    };

    const isExpired = (expiresAt: string | null) => {
        if (!expiresAt) return false;
        return new Date(expiresAt) < new Date();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users Carts" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Users Shopping Carts
                        </h2>
                        <p className="text-muted-foreground">
                            View all customer shopping carts (guest and
                            registered users)
                        </p>
                    </div>
                </div>

                <div className="flex gap-4">
                <Select
                    value={filters.type || 'all'}
                    onValueChange={(value) =>
                        handleFilterChange('type', value)
                    }
                >
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Carts</SelectItem>
                        <SelectItem value="user">User Carts</SelectItem>
                        <SelectItem value="guest">Guest Carts</SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={filters.status || 'all'}
                    onValueChange={(value) =>
                        handleFilterChange('status', value)
                    }
                >
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                </Select>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 bg-card dark:border-sidebar-border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>User/Session</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {carts.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center">
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <ShoppingCart className="mb-4 size-12 text-muted-foreground" />
                                        <p className="text-muted-foreground">
                                            No carts found
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            carts.data.map((cart) => (
                                <TableRow key={cart.id}>
                                    <TableCell className="font-medium">
                                        #{cart.id}
                                    </TableCell>
                                    <TableCell>
                                        {cart.user_id ? (
                                            <span className="inline-flex items-center gap-1 text-sm">
                                                <User className="size-4" />
                                                User
                                            </span>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">
                                                Guest
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {cart.user ? (
                                            <div>
                                                <div className="font-medium">
                                                    {cart.user.name}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {cart.user.email}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-sm text-muted-foreground">
                                                {cart.session_id?.substring(
                                                    0,
                                                    12,
                                                )}
                                                ...
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {cart.items_count}{' '}
                                        {cart.items_count === 1
                                            ? 'item'
                                            : 'items'}
                                    </TableCell>
                                    <TableCell>
                                        {isExpired(cart.expires_at) ? (
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
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {formatDistanceToNow(
                                            new Date(cart.created_at),
                                            { addSuffix: true },
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Link href={cartsShow.url(cart.id)}>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="size-8"
                                                >
                                                    <Eye className="size-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="size-8"
                                                onClick={() =>
                                                    handleDelete(cart.id)
                                                }
                                            >
                                                <Trash2 className="size-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                </div>

                {carts.data.length > 0 && carts.meta && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Showing {carts.meta.from} to {carts.meta.to} of{' '}
                            {carts.meta.total} carts
                        </p>
                        <div className="flex gap-2">
                            {carts.links?.map((link: any, index: number) => (
                                <Button
                                    key={index}
                                    variant={
                                        link.active ? 'default' : 'outline'
                                    }
                                    size="sm"
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url)}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
