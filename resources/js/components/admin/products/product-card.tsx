import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { destroy as destroyProductRoute, edit as editProductRoute } from '@/routes/admin/products';
import { router } from '@inertiajs/react';
import { AlertTriangle, Image as ImageIcon, MoreVertical, Package, Pencil, Trash2 } from 'lucide-react';

interface Category {
    id: number;
    name: string;
    slug: string;
    parent_id?: number | null;
    parent?: {
        id: number;
        name: string;
    };
}

interface Variation {
    id: number;
    price: number | string;
}

interface Product {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    type: 'single' | 'variable';
    price: number | string;
    stock_quantity: number;
    alert_threshold: number;
    status: 'draft' | 'published' | 'archived';
    is_low_stock: boolean;
    is_out_of_stock: boolean;
    created_at: string;
    updated_at: string;
    categories?: Category[];
    variations?: Variation[];
    primary_image_url?: string | null;
    primary_image_thumb_url?: string | null;
    primary_image_medium_url?: string | null;
}

interface Props {
    product: Product;
}

export default function ProductCard({ product }: Props) {
    const handleDelete = () => {
        if (
            confirm(
                `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
            )
        ) {
            router.delete(destroyProductRoute({ id: product.id }).url);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'draft':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'archived':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
            default:
                return '';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'single':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
            case 'variable':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
            default:
                return '';
        }
    };

    const getPriceRange = () => {
        if (product.type === 'variable' && product.variations && product.variations.length > 0) {
            const prices = product.variations.map(v =>
                typeof v.price === 'number' ? v.price : parseFloat(v.price)
            );
            const min = Math.min(...prices);
            const max = Math.max(...prices);
            if (min === max) {
                return `$${min.toFixed(2)}`;
            }
            return `$${min.toFixed(2)} - $${max.toFixed(2)}`;
        }
        return `$${typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(product.price).toFixed(2)}`;
    };

    return (
        <Card className="flex flex-col overflow-hidden">
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden bg-muted">
                {product.primary_image_thumb_url ? (
                    <img
                        src={product.primary_image_thumb_url}
                        alt={product.name}
                        className="size-full object-cover transition-transform hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex size-full items-center justify-center">
                        <ImageIcon className="size-12 text-muted-foreground/50" />
                    </div>
                )}

                {/* Dropdown Menu Overlay */}
                <div className="absolute right-2 top-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="secondary"
                                size="sm"
                                className="size-8 p-0 shadow-sm"
                            >
                                <MoreVertical className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() =>
                                    router.get(
                                        editProductRoute({ id: product.id }).url,
                                    )
                                }
                            >
                                <Pencil className="mr-2 size-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={handleDelete}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="mr-2 size-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <CardHeader className="pb-3">
                <div className="space-y-1.5">
                    <CardTitle className="line-clamp-1 text-base">
                        {product.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-1 text-xs">
                        {product.slug}
                    </CardDescription>
                </div>

                {/* Status and Type Badges */}
                <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(product.status)}>
                        {product.status}
                    </Badge>
                    <Badge className={getTypeColor(product.type)}>
                        {product.type}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="flex-1 space-y-3 pb-3">
                {/* Category Badges */}
                {product.categories && product.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {product.categories.slice(0, 2).map((category) => (
                            <Badge
                                key={category.id}
                                variant="outline"
                                className="text-xs"
                            >
                                <Package className="mr-1 size-3" />
                                {category.parent && `${category.parent.name} / `}
                                {category.name}
                            </Badge>
                        ))}
                        {product.categories.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                                +{product.categories.length - 2}
                            </Badge>
                        )}
                    </div>
                )}

                {product.description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                        {product.description}
                    </p>
                )}

                <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Price</span>
                        <span className="font-semibold">
                            {getPriceRange()}
                        </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Stock</span>
                        <div className="flex items-center gap-1.5">
                            {product.is_out_of_stock && (
                                <AlertTriangle className="size-4 text-destructive" />
                            )}
                            {product.is_low_stock && !product.is_out_of_stock && (
                                <AlertTriangle className="size-4 text-yellow-600 dark:text-yellow-500" />
                            )}
                            <span
                                className={
                                    product.is_out_of_stock
                                        ? 'font-semibold text-destructive'
                                        : product.is_low_stock
                                          ? 'font-semibold text-yellow-600 dark:text-yellow-500'
                                          : 'font-semibold'
                                }
                            >
                                {product.stock_quantity}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="pt-0">
                <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() =>
                        router.get(editProductRoute({ id: product.id }).url)
                    }
                >
                    <Pencil className="mr-2 size-4" />
                    Edit Product
                </Button>
            </CardFooter>
        </Card>
    );
}
