import { router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ProductFiltersProps {
    filters: {
        search?: string;
        category?: string;
        min_price?: string;
        max_price?: string;
        in_stock?: boolean;
        sort?: string;
    };
}

export function ProductFilters({ filters }: ProductFiltersProps) {
    const updateFilter = (key: string, value: string | boolean | undefined) => {
        router.get(
            '/products',
            { ...filters, [key]: value || undefined },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const clearFilters = () => {
        router.get('/products', {}, { replace: true });
    };

    const hasActiveFilters = Object.keys(filters).length > 0;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Filters</CardTitle>
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="h-8 px-2 lg:px-3"
                        >
                            Clear
                            <X className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Sort */}
                <div className="space-y-2">
                    <Label htmlFor="sort">Sort By</Label>
                    <Select
                        value={filters.sort || 'newest'}
                        onValueChange={(value) => updateFilter('sort', value)}
                    >
                        <SelectTrigger id="sort">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest</SelectItem>
                            <SelectItem value="price_asc">Price: Low to High</SelectItem>
                            <SelectItem value="price_desc">Price: High to Low</SelectItem>
                            <SelectItem value="name_asc">Name: A to Z</SelectItem>
                            <SelectItem value="name_desc">Name: Z to A</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Price Range */}
                <div className="space-y-2">
                    <Label>Price Range</Label>
                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            placeholder="Min"
                            min="0"
                            step="0.01"
                            value={filters.min_price || ''}
                            onChange={(e) => updateFilter('min_price', e.target.value)}
                        />
                        <span className="text-gray-500">-</span>
                        <Input
                            type="number"
                            placeholder="Max"
                            min="0"
                            step="0.01"
                            value={filters.max_price || ''}
                            onChange={(e) => updateFilter('max_price', e.target.value)}
                        />
                    </div>
                </div>

                {/* Stock Availability */}
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="in_stock"
                        checked={filters.in_stock || false}
                        onCheckedChange={(checked) => updateFilter('in_stock', checked === true)}
                    />
                    <Label
                        htmlFor="in_stock"
                        className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        In Stock Only
                    </Label>
                </div>
            </CardContent>
        </Card>
    );
}
