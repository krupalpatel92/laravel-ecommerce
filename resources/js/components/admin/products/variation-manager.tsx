import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import VariationForm from './variation-form';
import VariationList from './variation-list';

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
    variations: Variation[];
    onVariationsChange: (variations: Variation[]) => void;
    productName?: string;
}

export default function VariationManager({
    variations,
    onVariationsChange,
    productName = '',
}: Props) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const handleAddVariation = () => {
        setEditingIndex(null);
        setIsFormOpen(true);
    };

    const handleEditVariation = (index: number) => {
        setEditingIndex(index);
        setIsFormOpen(true);
    };

    const handleSaveVariation = (variation: Variation) => {
        if (editingIndex !== null) {
            // Update existing variation
            const updated = [...variations];
            updated[editingIndex] = variation;
            onVariationsChange(updated);
        } else {
            // Add new variation
            onVariationsChange([...variations, variation]);
        }

        setIsFormOpen(false);
        setEditingIndex(null);
    };

    const handleDeleteVariation = (index: number) => {
        if (
            confirm(
                'Are you sure you want to delete this variation? This action cannot be undone.',
            )
        ) {
            onVariationsChange(variations.filter((_, i) => i !== index));
        }
    };

    const getTotalStock = (): number => {
        return variations.reduce((total, v) => {
            const stock =
                typeof v.stock_quantity === 'number'
                    ? v.stock_quantity
                    : parseInt(v.stock_quantity) || 0;
            return total + stock;
        }, 0);
    };

    const getPriceRange = (): string => {
        if (variations.length === 0) return '$0.00';

        const prices = variations.map((v) =>
            typeof v.price === 'number' ? v.price : parseFloat(v.price) || 0,
        );

        const min = Math.min(...prices);
        const max = Math.max(...prices);

        if (min === max) {
            return `$${min.toFixed(2)}`;
        }

        return `$${min.toFixed(2)} - $${max.toFixed(2)}`;
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">
                        Variations ({variations.length})
                    </h3>
                    {variations.length > 0 && (
                        <div className="mt-1 flex gap-4 text-sm text-muted-foreground">
                            <span>Total Stock: {getTotalStock()} units</span>
                            <span>Price Range: {getPriceRange()}</span>
                        </div>
                    )}
                </div>
                <Button type="button" onClick={handleAddVariation}>
                    <Plus className="mr-2 size-4" />
                    Add Variation
                </Button>
            </div>

            <VariationList
                variations={variations}
                onEdit={handleEditVariation}
                onDelete={handleDeleteVariation}
            />

            <VariationForm
                open={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false);
                    setEditingIndex(null);
                }}
                onSave={handleSaveVariation}
                variation={
                    editingIndex !== null ? variations[editingIndex] : undefined
                }
                productName={productName}
            />
        </div>
    );
}
