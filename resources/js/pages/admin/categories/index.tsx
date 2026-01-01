import AppLayout from '@/layouts/app-layout';
import { index as categoriesIndex, destroy as destroyCategory } from '@/routes/admin/categories';
import { Head, router } from '@inertiajs/react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Categories',
        href: categoriesIndex().url,
    },
];

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
    parent_id: number | null;
    parent?: Category;
    children?: Category[];
    products_count?: number;
}

interface Props {
    categories: Category[];
}

export default function CategoriesIndex({ categories }: Props) {
    const handleDelete = (category: Category) => {
        if (
            confirm(
                `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
            )
        ) {
            router.delete(destroyCategory({ category: category.id }).url, {
                preserveScroll: true,
            });
        }
    };

    const renderCategoryRow = (category: Category, level = 0) => {
        const indent = level > 0 ? '├─ ' : '';
        const basePadding = 1; // 1rem = 16px base padding
        const additionalPadding = level * 2; // 2rem per level
        const totalPadding = basePadding + additionalPadding;

        return (
            <>
                <TableRow key={category.id}>
                    <TableCell style={{ paddingLeft: `${totalPadding}rem` }}>
                        <span className="font-medium">
                            {indent}
                            {category.name}
                        </span>
                    </TableCell>
                    <TableCell>
                        <code className="text-xs">{category.slug}</code>
                    </TableCell>
                    <TableCell>
                        <Badge variant="secondary">
                            {category.products_count || 0}
                        </Badge>
                    </TableCell>
                    <TableCell>
                        {category.is_active ? (
                            <Badge variant="default">Active</Badge>
                        ) : (
                            <Badge variant="secondary">Inactive</Badge>
                        )}
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                    router.visit(
                                        `/admin/categories/${category.id}/edit`,
                                    )
                                }
                            >
                                <Edit className="size-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(category)}
                            >
                                <Trash2 className="size-4 text-destructive" />
                            </Button>
                        </div>
                    </TableCell>
                </TableRow>
                {category.children?.map((child) =>
                    renderCategoryRow(child, level + 1),
                )}
            </>
        );
    };

    // Get parent categories (those without parent_id)
    const parentCategories = categories.filter((c) => !c.parent_id);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Categories
                        </h2>
                        <p className="text-muted-foreground">
                            Manage product categories and subcategories
                        </p>
                    </div>
                    <Button
                        onClick={() => router.visit('/admin/categories/create')}
                    >
                        <Plus className="mr-2 size-4" />
                        Add Category
                    </Button>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 bg-card dark:border-sidebar-border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Products</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {parentCategories.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="text-center text-muted-foreground"
                                    >
                                        No categories found. Create your first
                                        category to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                parentCategories.map((category) =>
                                    renderCategoryRow(category),
                                )
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
