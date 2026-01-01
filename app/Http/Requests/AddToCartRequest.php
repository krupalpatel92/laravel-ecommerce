<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;

class AddToCartRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Open to everyone (guests and authenticated users)
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'variation_id' => ['nullable', 'integer', 'exists:product_variations,id'],
            'quantity' => ['required', 'integer', 'min:1', 'max:99'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'product_id.required' => 'Please select a product',
            'product_id.exists' => 'Product not found',
            'variation_id.exists' => 'Product variation not found',
            'quantity.required' => 'Please specify quantity',
            'quantity.min' => 'Quantity must be at least 1',
            'quantity.max' => 'Maximum quantity is 99',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Validate variation is required for variable products
            if ($this->product_id) {
                $product = Product::find($this->product_id);

                if ($product && $product->type === 'variable' && ! $this->variation_id) {
                    $validator->errors()->add('variation_id', 'Please select product options');
                }
            }
        });
    }
}
