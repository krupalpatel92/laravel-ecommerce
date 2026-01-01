<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * @OA\Schema(
 *     schema="Media",
 *     type="object",
 *     title="Media",
 *     description="Media resource",
 *
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="product_id", type="integer", example=5),
 *     @OA\Property(property="collection_name", type="string", example="product-images"),
 *     @OA\Property(property="file_name", type="string", example="product-image.jpg"),
 *     @OA\Property(property="mime_type", type="string", example="image/jpeg"),
 *     @OA\Property(property="size", type="integer", example=1024000),
 *     @OA\Property(property="url", type="string", example="/storage/1/product-image.jpg"),
 *     @OA\Property(property="thumb_url", type="string", example="/storage/1/conversions/product-image-thumb.jpg"),
 *     @OA\Property(property="medium_url", type="string", example="/storage/1/conversions/product-image-medium.jpg"),
 *     @OA\Property(property="large_url", type="string", example="/storage/1/conversions/product-image-large.jpg"),
 *     @OA\Property(property="is_primary", type="boolean", example=true),
 *     @OA\Property(property="order", type="integer", example=1)
 * )
 *
 * @mixin Media
 */
class MediaResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->model_id,
            'collection_name' => $this->collection_name,
            'file_name' => $this->file_name,
            'mime_type' => $this->mime_type,
            'size' => $this->size,
            'url' => $this->getUrl(),
            'thumb_url' => $this->getUrl('thumb'),
            'medium_url' => $this->getUrl('medium'),
            'large_url' => $this->getUrl('large'),
            'is_primary' => $this->getCustomProperty('is_primary', false),
            'order' => $this->order_column,
        ];
    }
}
