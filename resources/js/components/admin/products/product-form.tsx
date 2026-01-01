import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { store as storeProductRoute, update as updateProductRoute } from '@/routes/admin/products';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { FormEvent, useState } from 'react';
import VariationManager from './variation-manager';

interface Category {
    id: number;
    name: string;
    slug: string;
    parent_id: number | null;
    parent?: {
        id: number;
        name: string;
    };
}

interface Variation {
    id?: number;
    name: string;
    sku: string;
    price: number | string;
    stock_quantity: number | string;
    alert_threshold?: number | string;
    attributes?: Record<string, string>;
}

interface Product {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    type: 'single' | 'variable';
    price: number;
    stock_quantity: number;
    alert_threshold: number;
    status: 'draft' | 'published' | 'archived';
    categories?: Category[];
    variations?: Variation[];
}

interface Props {
    product?: Product;
    categories: Category[];
    mode: 'create' | 'edit';
}

interface FormData {
    name: string;
    description: string;
    type: string;
    price: string;
    stock_quantity: string;
    alert_threshold: string;
    status: string;
    category_ids: number[];
    variations?: Variation[];
}

export default function ProductForm({ product, categories, mode }: Props) {
    const { data, setData, post, put, processing, errors, recentlySuccessful } = useForm<FormData>({
        name: product?.name || '',
        description: product?.description || '',
        type: product?.type || 'single',
        price: product?.price?.toString() || '',
        stock_quantity: product?.stock_quantity?.toString() || '0',
        alert_threshold: product?.alert_threshold?.toString() || '10',
        status: product?.status || 'draft',
        category_ids: product?.categories?.map((c) => c.id) || [],
        variations: product?.variations || [],
    });

    const handleCategoryToggle = (categoryId: number) => {
        const updated = data.category_ids.includes(categoryId)
            ? data.category_ids.filter((id) => id !== categoryId)
            : [...data.category_ids, categoryId];
        setData('category_ids', updated);
    };

    const handleVariationsChange = (variations: Variation[]) => {
        setData('variations', variations);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        const url = mode === 'create'
            ? storeProductRoute().url
            : updateProductRoute({ id: product!.id }).url;

        if (mode === 'create') {
            post(url, {
                preserveScroll: true,
            });
        } else {
            put(url, {
                preserveScroll: true,
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {(() => (
                <>
                    <div className="space-y-6 rounded-xl border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                        <div>
                            <h3 className="text-lg font-semibold">
                                Basic Information
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Essential product details
                            </p>
                        </div>

                        <Separator />

                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">
                                    Product Name{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Enter product name"
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Enter product description"
                                    rows={4}
                                />
                                <InputError message={errors.description} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 rounded-xl border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                        <div>
                            <h3 className="text-lg font-semibold">
                                Product Type & Pricing
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Configure product type and price
                            </p>
                        </div>

                        <Separator />

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="type">
                                    Product Type{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={data.type}
                                    onValueChange={(value) => setData('type', value)}
                                >
                                    <SelectTrigger id="type">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="single">
                                            Single Product
                                        </SelectItem>
                                        <SelectItem value="variable">
                                            Variable Product
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.type} />
                            </div>

                            {data.type === 'single' && (
                                <div className="grid gap-2">
                                    <Label htmlFor="price">
                                        Price ($){' '}
                                        <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="price"
                                        name="price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.price}
                                        onChange={(e) => setData('price', e.target.value)}
                                        placeholder="0.00"
                                        required
                                    />
                                    <InputError message={errors.price} />
                                </div>
                            )}
                        </div>
                    </div>

                    {data.type === 'single' && (
                        <div className="space-y-6 rounded-xl border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                            <div>
                                <h3 className="text-lg font-semibold">
                                    Inventory Management
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Manage stock levels and alerts
                                </p>
                            </div>

                            <Separator />

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="stock_quantity">
                                        Stock Quantity{' '}
                                        <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="stock_quantity"
                                        name="stock_quantity"
                                        type="number"
                                        min="0"
                                        value={data.stock_quantity}
                                        onChange={(e) => setData('stock_quantity', e.target.value)}
                                        placeholder="0"
                                        required
                                    />
                                    <InputError message={errors.stock_quantity} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="alert_threshold">
                                        Low Stock Alert Threshold
                                    </Label>
                                    <Input
                                        id="alert_threshold"
                                        name="alert_threshold"
                                        type="number"
                                        min="0"
                                        value={data.alert_threshold}
                                        onChange={(e) => setData('alert_threshold', e.target.value)}
                                        placeholder="10"
                                    />
                                    <InputError message={errors.alert_threshold} />
                                </div>
                            </div>
                        </div>
                    )}

                    {data.type === 'variable' && (
                        <div className="space-y-6 rounded-xl border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                            <div>
                                <h3 className="text-lg font-semibold">
                                    Product Variations
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Manage product variations with individual pricing and stock
                                </p>
                            </div>

                            <Separator />

                            <VariationManager
                                variations={data.variations || []}
                                onVariationsChange={handleVariationsChange}
                                productName={data.name}
                            />
                            <InputError message={errors.variations} />
                        </div>
                    )}

                    <div className="space-y-6 rounded-xl border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                        <div>
                            <h3 className="text-lg font-semibold">
                                Categories & Status
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Organize and publish your product
                            </p>
                        </div>

                        <Separator />

                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="status">
                                    Status{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={data.status}
                                    onValueChange={(value) => setData('status', value)}
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">
                                            Draft
                                        </SelectItem>
                                        <SelectItem value="published">
                                            Published
                                        </SelectItem>
                                        <SelectItem value="archived">
                                            Archived
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.status} />
                            </div>

                            <div className="grid gap-3">
                                <Label>Categories</Label>
                                <div className="space-y-2 rounded-md border p-4">
                                    {categories.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">
                                            No categories available. Please
                                            create categories first.
                                        </p>
                                    ) : (
                                        categories.map((category) => (
                                            <div
                                                key={category.id}
                                                className="flex items-center space-x-2"
                                                style={{
                                                    paddingLeft: category.parent_id ? '1.5rem' : '0',
                                                }}
                                            >
                                                <Checkbox
                                                    id={`category-${category.id}`}
                                                    checked={data.category_ids.includes(
                                                        category.id,
                                                    )}
                                                    onCheckedChange={() =>
                                                        handleCategoryToggle(
                                                            category.id,
                                                        )
                                                    }
                                                />
                                                <Label
                                                    htmlFor={`category-${category.id}`}
                                                    className="cursor-pointer font-normal"
                                                >
                                                    {category.parent_id && '├─ '}
                                                    {category.name}
                                                    {category.parent && (
                                                        <span className="ml-2 text-xs text-muted-foreground">
                                                            (under {category.parent.name})
                                                        </span>
                                                    )}
                                                </Label>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <InputError message={errors.category_ids} />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button type="submit" disabled={processing}>
                            {processing && (
                                <Loader2 className="mr-2 size-4 animate-spin" />
                            )}
                            {mode === 'create'
                                ? 'Create Product'
                                : 'Update Product'}
                        </Button>

                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-in-out"
                            enterFrom="opacity-0"
                            leave="transition ease-in-out"
                            leaveTo="opacity-0"
                        >
                            <p className="text-sm text-green-600 dark:text-green-400">
                                {mode === 'create' ? 'Created' : 'Updated'}{' '}
                                successfully
                            </p>
                        </Transition>
                    </div>
                </>
            ))()}
        </form>
    );
}
