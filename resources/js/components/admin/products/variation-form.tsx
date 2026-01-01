import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Plus, Sparkles, X } from 'lucide-react';
import { FormEvent, useState, useEffect } from 'react';

interface Variation {
    id?: number;
    name: string;
    sku: string;
    price: number | string;
    stock_quantity: number | string;
    alert_threshold?: number | string;
    attributes?: Record<string, string>;
}

interface Props {
    open: boolean;
    onClose: () => void;
    onSave: (variation: Variation) => void;
    variation?: Variation;
    productName?: string;
}

export default function VariationForm({
    open,
    onClose,
    onSave,
    variation,
    productName = '',
}: Props) {
    const [name, setName] = useState(variation?.name || '');
    const [sku, setSku] = useState(variation?.sku || '');
    const [price, setPrice] = useState(
        variation?.price?.toString() || '',
    );
    const [stockQuantity, setStockQuantity] = useState(
        variation?.stock_quantity?.toString() || '',
    );
    const [alertThreshold, setAlertThreshold] = useState(
        variation?.alert_threshold?.toString() || '10',
    );
    const [attributes, setAttributes] = useState<
        Array<{ key: string; value: string }>
    >(
        variation?.attributes
            ? Object.entries(variation.attributes).map(([key, value]) => ({
                  key,
                  value,
              }))
            : [],
    );

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Update form fields when variation prop changes or modal opens
    useEffect(() => {
        if (open) {
            setName(variation?.name || '');
            setSku(variation?.sku || '');
            setPrice(variation?.price?.toString() || '');
            setStockQuantity(variation?.stock_quantity?.toString() || '');
            setAlertThreshold(variation?.alert_threshold?.toString() || '10');
            setAttributes(
                variation?.attributes
                    ? Object.entries(variation.attributes).map(([key, value]) => ({
                          key,
                          value,
                      }))
                    : [],
            );
            setErrors({});
        }
    }, [open, variation]);

    const handleAddAttribute = () => {
        setAttributes([...attributes, { key: '', value: '' }]);
    };

    const handleRemoveAttribute = (index: number) => {
        setAttributes(attributes.filter((_, i) => i !== index));
    };

    const handleAttributeChange = (
        index: number,
        field: 'key' | 'value',
        value: string,
    ) => {
        const updated = [...attributes];
        updated[index][field] = value;
        setAttributes(updated);
    };

    const generateSKU = () => {
        const slug = productName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        const attributeParts = attributes
            .filter((attr) => attr.key && attr.value)
            .map((attr) => attr.value.toLowerCase().replace(/[^a-z0-9]/g, ''))
            .join('-');

        const generated = attributeParts
            ? `${slug}-${attributeParts}`
            : `${slug}-var-${Date.now().toString().slice(-4)}`;

        setSku(generated.toUpperCase());
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!name.trim()) {
            newErrors.name = 'Variation name is required';
        }

        if (!sku.trim()) {
            newErrors.sku = 'SKU is required';
        }

        if (!price || parseFloat(price) < 0) {
            newErrors.price = 'Valid price is required';
        }

        if (!stockQuantity || parseInt(stockQuantity) < 0) {
            newErrors.stock_quantity = 'Valid stock quantity is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        const attributesObject = attributes
            .filter((attr) => attr.key && attr.value)
            .reduce(
                (acc, attr) => {
                    acc[attr.key] = attr.value;
                    return acc;
                },
                {} as Record<string, string>,
            );

        onSave({
            ...(variation?.id && { id: variation.id }),
            name,
            sku,
            price: parseFloat(price),
            stock_quantity: parseInt(stockQuantity),
            alert_threshold: parseInt(alertThreshold),
            attributes:
                Object.keys(attributesObject).length > 0
                    ? attributesObject
                    : undefined,
        });

        handleClose();
    };

    const handleClose = () => {
        setName('');
        setSku('');
        setPrice('');
        setStockQuantity('');
        setAlertThreshold('10');
        setAttributes([]);
        setErrors({});
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {variation ? 'Edit Variation' : 'Add Variation'}
                        </DialogTitle>
                        <DialogDescription>
                            {variation
                                ? 'Update the variation details below.'
                                : 'Add a new variation for this product.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">
                                Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Large Red"
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="sku">
                                SKU <span className="text-destructive">*</span>
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    id="sku"
                                    value={sku}
                                    onChange={(e) => setSku(e.target.value)}
                                    placeholder="e.g., PROD-LG-RED"
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={generateSKU}
                                    disabled={!productName}
                                >
                                    <Sparkles className="mr-2 size-4" />
                                    Generate
                                </Button>
                            </div>
                            <InputError message={errors.sku} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="price">
                                    Price ($){' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="0.00"
                                />
                                <InputError message={errors.price} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="stock_quantity">
                                    Stock Quantity{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="stock_quantity"
                                    type="number"
                                    min="0"
                                    value={stockQuantity}
                                    onChange={(e) =>
                                        setStockQuantity(e.target.value)
                                    }
                                    placeholder="0"
                                />
                                <InputError message={errors.stock_quantity} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="alert_threshold">
                                Low Stock Alert Threshold
                            </Label>
                            <Input
                                id="alert_threshold"
                                type="number"
                                min="0"
                                value={alertThreshold}
                                onChange={(e) =>
                                    setAlertThreshold(e.target.value)
                                }
                                placeholder="10"
                            />
                            <p className="text-xs text-muted-foreground">
                                Get notified when stock falls below this level
                            </p>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Attributes (Optional)</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAddAttribute}
                                >
                                    <Plus className="mr-2 size-4" />
                                    Add Attribute
                                </Button>
                            </div>

                            {attributes.length > 0 && (
                                <div className="space-y-2">
                                    {attributes.map((attr, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-2"
                                        >
                                            <Input
                                                placeholder="Key (e.g., Size)"
                                                value={attr.key}
                                                onChange={(e) =>
                                                    handleAttributeChange(
                                                        index,
                                                        'key',
                                                        e.target.value,
                                                    )
                                                }
                                                className="flex-1"
                                            />
                                            <Input
                                                placeholder="Value (e.g., Large)"
                                                value={attr.value}
                                                onChange={(e) =>
                                                    handleAttributeChange(
                                                        index,
                                                        'value',
                                                        e.target.value,
                                                    )
                                                }
                                                className="flex-1"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    handleRemoveAttribute(index)
                                                }
                                                className="text-destructive"
                                            >
                                                <X className="size-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {attributes.length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                    No attributes added. Attributes help describe
                                    variation differences (e.g., Size: Large, Color:
                                    Red).
                                </p>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">
                            {variation ? 'Update' : 'Add'} Variation
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
