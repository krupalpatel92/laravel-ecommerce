import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';

interface ImageFile {
    file: File;
    preview: string;
}

interface Props {
    onUpload: (files: File[]) => void;
    maxFiles?: number;
    disabled?: boolean;
}

export default function ImageUploader({
    onUpload,
    maxFiles = 10,
    disabled = false,
}: Props) {
    const [selectedImages, setSelectedImages] = useState<ImageFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (files: FileList | null) => {
        if (!files) return;

        const validFiles: ImageFile[] = [];
        const filesArray = Array.from(files);

        filesArray.forEach((file) => {
            if (file.type.startsWith('image/')) {
                validFiles.push({
                    file,
                    preview: URL.createObjectURL(file),
                });
            }
        });

        const newImages = [...selectedImages, ...validFiles].slice(0, maxFiles);
        setSelectedImages(newImages);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files);
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const removeImage = (index: number) => {
        const newImages = selectedImages.filter((_, i) => i !== index);
        setSelectedImages(newImages);
    };

    const handleUpload = () => {
        if (selectedImages.length === 0) return;

        const files = selectedImages.map((img) => img.file);
        onUpload(files);

        // Clear previews
        selectedImages.forEach((img) => URL.revokeObjectURL(img.preview));
        setSelectedImages([]);
    };

    return (
        <div className="space-y-4">
            <div
                className={`relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                    isDragging
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={disabled ? undefined : handleClick}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    disabled={disabled}
                />
                <Upload className="mx-auto mb-4 size-12 text-muted-foreground" />
                <p className="mb-2 text-sm font-medium">
                    Drop images here or click to upload
                </p>
                <p className="text-xs text-muted-foreground">
                    JPEG, PNG, WEBP • Max 5MB per image • Up to {maxFiles}{' '}
                    images
                </p>
            </div>

            {selectedImages.length > 0 && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {selectedImages.map((image, index) => (
                            <div
                                key={index}
                                className="group relative aspect-square overflow-hidden rounded-lg border"
                            >
                                <img
                                    src={image.preview}
                                    alt={`Preview ${index + 1}`}
                                    className="size-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute right-2 top-2 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                                    disabled={disabled}
                                >
                                    <X className="size-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between">
                        <p className="text-sm text-muted-foreground">
                            {selectedImages.length} image(s) selected
                        </p>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    selectedImages.forEach((img) =>
                                        URL.revokeObjectURL(img.preview),
                                    );
                                    setSelectedImages([]);
                                }}
                                disabled={disabled}
                            >
                                Clear
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                onClick={handleUpload}
                                disabled={disabled}
                            >
                                <Upload className="mr-2 size-4" />
                                Upload
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
