import { Button } from '@/components/ui/button';
import { Star, Trash2 } from 'lucide-react';
import { useState } from 'react';

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

interface Props {
    images: Media[];
    onDelete: (mediaId: number) => void;
    onSetPrimary: (mediaId: number) => void;
    onReorder?: (mediaIds: number[]) => void;
    disabled?: boolean;
}

export default function ImageGallery({
    images,
    onDelete,
    onSetPrimary,
    onReorder,
    disabled = false,
}: Props) {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const sortedImages = [...images].sort((a, b) => a.order - b.order);

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        setHoveredIndex(index);
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();

        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null);
            setHoveredIndex(null);
            return;
        }

        const reorderedImages = [...sortedImages];
        const [draggedImage] = reorderedImages.splice(draggedIndex, 1);
        reorderedImages.splice(dropIndex, 0, draggedImage);

        const newOrder = reorderedImages.map((img) => img.id);
        onReorder?.(newOrder);

        setDraggedIndex(null);
        setHoveredIndex(null);
    };

    const handleDelete = (mediaId: number) => {
        if (
            confirm(
                'Are you sure you want to delete this image? This action cannot be undone.',
            )
        ) {
            onDelete(mediaId);
        }
    };

    if (sortedImages.length === 0) {
        return (
            <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-sm text-muted-foreground">
                    No images uploaded yet
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                {sortedImages.length} image(s) • Drag to reorder
            </p>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {sortedImages.map((image, index) => (
                    <div
                        key={image.id}
                        draggable={!disabled}
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={(e) => handleDrop(e, index)}
                        className={`group relative aspect-square cursor-move overflow-hidden rounded-lg border transition-all ${
                            image.is_primary
                                ? 'ring-2 ring-primary ring-offset-2'
                                : ''
                        } ${
                            draggedIndex === index ? 'opacity-50' : ''
                        } ${
                            hoveredIndex === index && draggedIndex !== index
                                ? 'scale-105'
                                : ''
                        } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                        <img
                            src={image.thumb_url || image.url}
                            alt={image.file_name}
                            className="size-full object-cover"
                        />

                        {/* Primary badge */}
                        {image.is_primary && (
                            <div className="absolute left-2 top-2 rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                                Primary
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            {!image.is_primary && (
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="secondary"
                                    className="size-8"
                                    onClick={() => onSetPrimary(image.id)}
                                    disabled={disabled}
                                    title="Set as primary"
                                >
                                    <Star className="size-4" />
                                </Button>
                            )}
                            <Button
                                type="button"
                                size="icon"
                                variant="destructive"
                                className="size-8"
                                onClick={() => handleDelete(image.id)}
                                disabled={disabled}
                                title="Delete image"
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        </div>

                        {/* File name */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                            <p className="truncate text-xs text-white">
                                {image.file_name}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
