<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Cart;
use App\Models\Product;
use App\Models\ProductVariation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CartItem>
 */
class CartItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $product = Product::factory()->create();

        return [
            'cart_id' => Cart::factory(),
            'product_id' => $product->id,
            'variation_id' => null,
            'quantity' => fake()->numberBetween(1, 5),
            'price' => $product->price,
        ];
    }

    /**
     * Indicate that the cart item has a variation.
     */
    public function withVariation(): static
    {
        return $this->state(function (array $attributes) {
            $product = Product::factory()->create(['type' => 'variable']);
            $variation = ProductVariation::factory()->create(['product_id' => $product->id]);

            return [
                'product_id' => $product->id,
                'variation_id' => $variation->id,
                'price' => $variation->price,
            ];
        });
    }
}
