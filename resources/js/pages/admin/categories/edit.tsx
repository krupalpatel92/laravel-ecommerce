import CategoryForm from '@/components/admin/categories/category-form';
import AppLayout from '@/layouts/app-layout';
import { index as categoriesIndex } from '@/routes/admin/categories';
import { Head, Link } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
    parent_id: number | null;
}

interface Props {
    category: Category;
    parentCategories: Category[];
}

export default function EditCategory({ category, parentCategories }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Categories',
            href: categoriesIndex().url,
        },
        {
            title: category.name,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${category.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div className="flex items-center gap-4">
                    <Link href={categoriesIndex().url}>
                        <Button variant="ghost" size="icon">
                            <ChevronLeft className="size-4" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Edit Category
                        </h2>
                        <p className="text-muted-foreground">
                            Update category details
                        </p>
                    </div>
                </div>

                <CategoryForm
                    category={category}
                    parentCategories={parentCategories}
                    mode="edit"
                />
            </div>
        </AppLayout>
    );
}
