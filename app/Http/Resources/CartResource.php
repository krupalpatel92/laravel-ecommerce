<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @OA\Schema(
 *     schema="Cart",
 *     type="object",
 *     title="Cart",
 *     description="Shopping cart resource",
 *
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="user_id", type="integer", nullable=true, example=5),
 *     @OA\Property(property="session_id", type="string", nullable=true, example="550e8400-e29b-41d4-a716-446655440000"),
 *     @OA\Property(
 *         property="items",
 *         type="array",
 *
 *         @OA\Items(ref="#/components/schemas/CartItem")
 *     ),
 *
 *     @OA\Property(property="item_count", type="integer", example=3),
 *     @OA\Property(property="total", type="number", format="float", example=2999.97),
 *     @OA\Property(property="expires_at", type="string", format="date-time", nullable=true, example="2025-01-05T12:00:00Z")
 * )
 *
 * @mixin \App\Models\Cart
 */
class CartResource extends JsonResource
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
            'user_id' => $this->user_id,
            'session_id' => $this->session_id,
            'items' => CartItemResource::collection($this->whenLoaded('items')),
            'item_count' => $this->getItemCount(),
            'total' => $this->getTotal(),
            'expires_at' => $this->expires_at?->toIso8601String(),
        ];
    }
}
