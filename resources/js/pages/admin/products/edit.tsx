import ProductForm from '@/components/admin/products/product-form';
import ImageGallery from '@/components/admin/products/image-gallery';
import ImageUploader from '@/components/admin/products/image-uploader';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { edit as editProductRoute, index as productsIndexRoute } from '@/routes/admin/products';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface Media {
    id: number;
    product_id: number;
    file_name: string;
    url: string;
    thumb_url: string;
    medium_url: string;
    is_primary: boolean;
    order: number;
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
    media?: Media[];
}

interface Props {
    product: Product;
    categories: Category[];
}

export default function EditProduct({ product, categories }: Props) {
    const [images, setImages] = useState<Media[]>(product.media || []);
    const [uploading, setUploading] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Products',
            href: productsIndexRoute().url,
        },
        {
            title: product.name,
            href: editProductRoute({ id: product.id }).url,
        },
    ];

    const handleUpload = async (files: File[]) => {
        setUploading(true);

        const formData = new FormData();
        files.forEach((file) => {
            formData.append('images[]', file);
        });

        try {
            const response = await fetch(
                `/api/v1/products/${product.id}/images`,
                {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-CSRF-TOKEN': document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                        Accept: 'application/json',
                    },
                    credentials: 'same-origin',
                },
            );

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            setImages([...images, ...data.data]);
            toast.success('Images uploaded successfully');
        } catch (error) {
            toast.error('Failed to upload images');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (mediaId: number) => {
        try {
            const response = await fetch(
                `/api/v1/products/${product.id}/images/${mediaId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'X-CSRF-TOKEN': document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                        Accept: 'application/json',
                    },
                    credentials: 'same-origin',
                },
            );

            if (!response.ok) {
                throw new Error('Delete failed');
            }

            setImages(images.filter((img) => img.id !== mediaId));
            toast.success('Image deleted successfully');
        } catch (error) {
            toast.error('Failed to delete image');
        }
    };

    const handleSetPrimary = async (mediaId: number) => {
        try {
            const response = await fetch(
                `/api/v1/products/${product.id}/images/${mediaId}/primary`,
                {
                    method: 'PUT',
                    headers: {
                        'X-CSRF-TOKEN': document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                        Accept: 'application/json',
                    },
                    credentials: 'same-origin',
                },
            );

            if (!response.ok) {
                throw new Error('Set primary failed');
            }

            setImages(
                images.map((img) => ({
                    ...img,
                    is_primary: img.id === mediaId,
                })),
            );
            toast.success('Primary image set successfully');
        } catch (error) {
            toast.error('Failed to set primary image');
        }
    };

    const handleReorder = async (mediaIds: number[]) => {
        try {
            const response = await fetch(
                `/api/v1/products/${product.id}/images/reorder`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({ order: mediaIds }),
                    credentials: 'same-origin',
                },
            );

            if (!response.ok) {
                throw new Error('Reorder failed');
            }

            // Update local state with new order
            const reordered = mediaIds.map((id, index) => {
                const img = images.find((i) => i.id === id);
                return img ? { ...img, order: index + 1 } : null;
            }).filter(Boolean) as Media[];

            setImages(reordered);
            toast.success('Images reordered successfully');
        } catch (error) {
            toast.error('Failed to reorder images');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${product.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            Edit Product
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Update product information
                        </p>
                    </div>
                    <Link href={productsIndexRoute().url}>
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 size-4" />
                            Back to Products
                        </Button>
                    </Link>
                </div>

                {/* Product Images Section */}
                <div className="space-y-6 rounded-xl border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                    <div>
                        <h3 className="text-lg font-semibold">
                            Product Images
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Upload and manage product images
                        </p>
                    </div>

                    <Separator />

                    <ImageUploader
                        onUpload={handleUpload}
                        disabled={uploading}
                    />

                    {images.length > 0 && (
                        <>
                            <Separator />
                            <ImageGallery
                                images={images}
                                onDelete={handleDelete}
                                onSetPrimary={handleSetPrimary}
                                onReorder={handleReorder}
                            />
                        </>
                    )}
                </div>

                <ProductForm
                    product={product}
                    categories={categories}
                    mode="edit"
                />
            </div>
        </AppLayout>
    );
}
