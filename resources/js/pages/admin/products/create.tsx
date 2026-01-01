import ProductForm from '@/components/admin/products/product-form';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { create as createProductRoute, index as productsIndexRoute } from '@/routes/admin/products';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Products',
        href: productsIndexRoute().url,
    },
    {
        title: 'Create Product',
        href: createProductRoute().url,
    },
];

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface Props {
    categories: Category[];
}

export default function CreateProduct({ categories }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Product" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            Create Product
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Add a new product to your catalog
                        </p>
                    </div>
                    <Link href={productsIndexRoute().url}>
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 size-4" />
                            Back to Products
                        </Button>
                    </Link>
                </div>

                <ProductForm categories={categories} mode="create" />
            </div>
        </AppLayout>
    );
}
