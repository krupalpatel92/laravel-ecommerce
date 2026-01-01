import { useState } from 'react';
import { ProductImage } from '@/types/product.types';
import { Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductGalleryProps {
    images: ProductImage[];
    productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
    const [selectedImage, setSelectedImage] = useState<ProductImage | null>(
        images.find((img) => img.is_primary) || images[0] || null
    );

    if (images.length === 0) {
        return (
            <div className="flex aspect-square items-center justify-center rounded-lg bg-gray-100">
                <Package className="h-32 w-32 text-gray-400" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                {selectedImage ? (
                    <img
                        src={selectedImage.url}
                        alt={productName}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-32 w-32 text-gray-400" />
                    </div>
                )}
            </div>

            {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                    {images.map((image) => (
                        <button
                            key={image.id}
                            type="button"
                            onClick={() => setSelectedImage(image)}
                            className={cn(
                                'relative aspect-square overflow-hidden rounded-lg border-2 transition-all',
                                selectedImage?.id === image.id
                                    ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-2'
                                    : 'border-gray-200 hover:border-gray-400'
                            )}
                        >
                            <img
                                src={image.thumb_url}
                                alt={`${productName} thumbnail ${image.id}`}
                                className="h-full w-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
