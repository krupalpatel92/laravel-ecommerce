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
import {
    store as storeCategoryRoute,
    update as updateCategoryRoute,
} from '@/routes/admin/categories';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { FormEvent } from 'react';

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
    parent_id: number | null;
}

interface Props {
    category?: Category;
    parentCategories: Category[];
    mode: 'create' | 'edit';
}

interface FormData {
    name: string;
    description: string;
    parent_id: string;
    is_active: boolean;
}

export default function CategoryForm({
    category,
    parentCategories,
    mode,
}: Props) {
    const { data, setData, post, put, processing, errors, recentlySuccessful } =
        useForm<FormData>({
            name: category?.name || '',
            description: category?.description || '',
            parent_id: category?.parent_id?.toString() || '',
            is_active: category?.is_active ?? true,
        });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        const submitData = {
            ...data,
            parent_id: data.parent_id ? parseInt(data.parent_id) : null,
        };

        const url =
            mode === 'create'
                ? storeCategoryRoute().url
                : updateCategoryRoute({ category: category!.id }).url;

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
            <div className="space-y-6 rounded-xl border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                <div>
                    <h3 className="text-lg font-semibold">
                        Category Information
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Basic details about the category
                    </p>
                </div>

                <Separator />

                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">
                            Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g., Electronics"
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
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                            placeholder="Enter category description"
                            rows={4}
                        />
                        <InputError message={errors.description} />
                    </div>
                </div>
            </div>

            <div className="space-y-6 rounded-xl border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                <div>
                    <h3 className="text-lg font-semibold">Organization</h3>
                    <p className="text-sm text-muted-foreground">
                        Category hierarchy and status
                    </p>
                </div>

                <Separator />

                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="parent_id">Parent Category</Label>
                        <Select
                            value={data.parent_id || 'none'}
                            onValueChange={(value) =>
                                setData('parent_id', value === 'none' ? '' : value)
                            }
                        >
                            <SelectTrigger id="parent_id">
                                <SelectValue placeholder="Select parent category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">
                                    None (Root Category)
                                </SelectItem>
                                {parentCategories.map((parentCat) => (
                                    <SelectItem
                                        key={parentCat.id}
                                        value={parentCat.id.toString()}
                                    >
                                        {parentCat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.parent_id} />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="is_active"
                            checked={data.is_active}
                            onCheckedChange={(checked) =>
                                setData('is_active', checked as boolean)
                            }
                        />
                        <Label
                            htmlFor="is_active"
                            className="cursor-pointer font-normal"
                        >
                            Active (visible to customers)
                        </Label>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Button type="submit" disabled={processing}>
                    {processing && (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                    )}
                    {mode === 'create' ? 'Create Category' : 'Update Category'}
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
        </form>
    );
}
