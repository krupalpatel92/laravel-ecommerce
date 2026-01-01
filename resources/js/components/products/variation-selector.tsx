import { ProductVariation } from '@/types/product.types';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { StockBadge } from './stock-badge';

interface VariationSelectorProps {
    variations: ProductVariation[];
    selectedVariation: ProductVariation | null;
    onSelect: (variation: ProductVariation) => void;
}

export function VariationSelector({
    variations,
    selectedVariation,
    onSelect,
}: VariationSelectorProps) {
    if (variations.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            <div>
                <Label htmlFor="variation">Select Variation</Label>
                <Select
                    value={selectedVariation?.id.toString()}
                    onValueChange={(value) => {
                        const variation = variations.find((v) => v.id.toString() === value);
                        if (variation) {
                            onSelect(variation);
                        }
                    }}
                >
                    <SelectTrigger id="variation" className="mt-2">
                        <SelectValue placeholder="Choose a variation" />
                    </SelectTrigger>
                    <SelectContent>
                        {variations.map((variation) => (
                            <SelectItem key={variation.id} value={variation.id.toString()}>
                                <div className="flex items-center justify-between gap-4">
                                    <span>{variation.name}</span>
                                    <span className="font-semibold">
                                        ${parseFloat(variation.price).toFixed(2)}
                                    </span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {selectedVariation && (
                <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Selected:</span>
                        <span className="font-semibold text-gray-900">{selectedVariation.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Price:</span>
                        <span className="text-lg font-bold text-gray-900">
                            ${parseFloat(selectedVariation.price).toFixed(2)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">SKU:</span>
                        <span className="text-sm text-gray-600">{selectedVariation.sku}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Stock:</span>
                        <StockBadge
                            stockStatus={
                                selectedVariation.stock_quantity > 0 ? 'in_stock' : 'out_of_stock'
                            }
                            stockQuantity={selectedVariation.stock_quantity}
                        />
                    </div>
                    {selectedVariation.attributes && Object.keys(selectedVariation.attributes).length > 0 && (
                        <div className="border-t border-gray-200 pt-2">
                            <span className="text-sm font-medium text-gray-700">Attributes:</span>
                            <div className="mt-1 space-y-1">
                                {Object.entries(selectedVariation.attributes).map(([key, value]) => (
                                    <div key={key} className="flex items-center justify-between text-sm">
                                        <span className="capitalize text-gray-600">{key}:</span>
                                        <span className="font-medium text-gray-900">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
