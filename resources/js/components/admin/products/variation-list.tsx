import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { AlertTriangle, Pencil, Trash2 } from 'lucide-react';

interface Variation {
    id?: number;
    name: string;
    sku: string;
    price: number | string;
    stock_quantity: number | string;
    attributes?: Record<string, string>;
}

interface Props {
    variations: Variation[];
    onEdit: (index: number) => void;
    onDelete: (index: number) => void;
}

export default function VariationList({ variations, onEdit, onDelete }: Props) {
    if (variations.length === 0) {
        return (
            <div className="rounded-md border border-dashed p-8 text-center">
                <p className="text-sm text-muted-foreground">
                    No variations added yet. Click "Add Variation" to get started.
                </p>
            </div>
        );
    }

    const formatPrice = (price: number | string): string => {
        const num = typeof price === 'number' ? price : parseFloat(price);
        return num.toFixed(2);
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Stock</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {variations.map((variation, index) => {
                        const stock =
                            typeof variation.stock_quantity === 'number'
                                ? variation.stock_quantity
                                : parseInt(variation.stock_quantity);
                        const isOutOfStock = stock === 0;
                        const isLowStock = stock > 0 && stock <= 10;

                        return (
                            <TableRow key={index}>
                                <TableCell className="font-medium">
                                    {variation.name}
                                    {variation.attributes &&
                                        Object.keys(variation.attributes).length >
                                            0 && (
                                            <div className="mt-1 flex gap-1">
                                                {Object.entries(
                                                    variation.attributes,
                                                ).map(([key, value]) => (
                                                    <span
                                                        key={key}
                                                        className="text-xs text-muted-foreground"
                                                    >
                                                        {key}: {value}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                </TableCell>
                                <TableCell className="font-mono text-sm">
                                    {variation.sku}
                                </TableCell>
                                <TableCell className="text-right">
                                    ${formatPrice(variation.price)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                        {isOutOfStock && (
                                            <AlertTriangle className="size-4 text-destructive" />
                                        )}
                                        {isLowStock && (
                                            <AlertTriangle className="size-4 text-yellow-600 dark:text-yellow-500" />
                                        )}
                                        <span
                                            className={
                                                isOutOfStock
                                                    ? 'font-semibold text-destructive'
                                                    : isLowStock
                                                      ? 'font-semibold text-yellow-600 dark:text-yellow-500'
                                                      : ''
                                            }
                                        >
                                            {stock}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onEdit(index)}
                                        >
                                            <Pencil className="size-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onDelete(index)}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
