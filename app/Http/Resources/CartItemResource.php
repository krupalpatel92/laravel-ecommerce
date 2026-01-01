<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @OA\Schema(
 *     schema="CartItem",
 *     type="object",
 *     title="Cart Item",
 *     description="Cart item resource",
 *
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(
 *         property="product",
 *         type="object",
 *         @OA\Property(property="id", type="integer", example=5),
 *         @OA\Property(property="name", type="string", example="Laptop"),
 *         @OA\Property(property="slug", type="string", example="laptop"),
 *         @OA\Property(property="type", type="string", enum={"single", "variable"}, example="variable"),
 *         @OA\Property(property="primary_image_thumb_url", type="string", nullable=true, example="/storage/1/conversions/laptop-thumb.jpg")
 *     ),
 *     @OA\Property(
 *         property="variation",
 *         type="object",
 *         nullable=true,
 *         @OA\Property(property="id", type="integer", example=3),
 *         @OA\Property(property="name", type="string", example="16GB RAM"),
 *         @OA\Property(property="sku", type="string", example="LAP-16GB"),
 *         @OA\Property(
 *             property="attributes",
 *             type="object",
 *             example={"ram": "16GB", "color": "Silver"}
 *         )
 *     ),
 *     @OA\Property(property="quantity", type="integer", example=2),
 *     @OA\Property(property="price", type="string", example="999.99"),
 *     @OA\Property(property="subtotal", type="number", format="float", example=1999.98)
 * )
 *
 * @mixin \App\Models\CartItem
 */
class CartItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $availableStock = $this->getAvailableStock();

        return [
            'id' => $this->id,
            'product' => [
                'id' => $this->product->id,
                'name' => $this->product->name,
                'slug' => $this->product->slug,
                'type' => $this->product->type,
                'primary_image_thumb_url' => $this->product->getPrimaryImageUrl('thumb'),
            ],
            'variation' => $this->when($this->variation, [
                'id' => $this->variation?->id,
                'name' => $this->variation?->name,
                'sku' => $this->variation?->sku,
                'attributes' => $this->variation?->attributes,
            ]),
            'quantity' => $this->quantity,
            'price' => $this->price,
            'subtotal' => $this->getSubtotal(),
            'available_stock' => $availableStock,
            'is_out_of_stock' => $availableStock === 0,
            'is_low_stock' => $availableStock > 0 && $availableStock < 5,
        ];
    }
}
