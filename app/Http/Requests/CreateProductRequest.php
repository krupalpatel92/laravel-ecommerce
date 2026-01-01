<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage-products') ?? false;
    }

    public function rules(): array
    {
        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['required', 'in:single,variable'],
            'status' => ['required', 'in:draft,published,archived'],
            'alert_threshold' => ['nullable', 'integer', 'min:0'],
            'category_ids' => ['nullable', 'array'],
            'category_ids.*' => ['integer', 'exists:categories,id'],
        ];

        // For single products, price and stock are required
        if ($this->input('type') === 'single') {
            $rules['price'] = ['required', 'numeric', 'min:0'];
            $rules['stock_quantity'] = ['required', 'integer', 'min:0'];
        }

        // For variable products, variations are required
        if ($this->input('type') === 'variable') {
            $rules['variations'] = ['required', 'array', 'min:1'];
            $rules['variations.*.name'] = ['required', 'string', 'max:255'];
            $rules['variations.*.sku'] = ['required', 'string', 'max:255', 'distinct'];
            $rules['variations.*.price'] = ['required', 'numeric', 'min:0'];
            $rules['variations.*.stock_quantity'] = ['required', 'integer', 'min:0'];
            $rules['variations.*.attributes'] = ['nullable', 'array'];
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Product name is required',
            'name.max' => 'Product name cannot exceed 255 characters',
            'type.required' => 'Product type is required',
            'type.in' => 'Product type must be either single or variable',
            'price.required' => 'Product price is required',
            'price.numeric' => 'Product price must be a valid number',
            'price.min' => 'Product price cannot be negative',
            'stock_quantity.required' => 'Stock quantity is required',
            'stock_quantity.integer' => 'Stock quantity must be an integer',
            'stock_quantity.min' => 'Stock quantity cannot be negative',
            'alert_threshold.integer' => 'Alert threshold must be an integer',
            'alert_threshold.min' => 'Alert threshold cannot be negative',
            'status.required' => 'Product status is required',
            'status.in' => 'Product status must be draft, published, or archived',
            'category_ids.array' => 'Categories must be an array',
            'category_ids.*.exists' => 'Selected category does not exist',
            'variations.required' => 'At least one variation is required for variable products',
            'variations.min' => 'Variable products must have at least one variation',
            'variations.*.name.required' => 'Variation name is required',
            'variations.*.sku.required' => 'Variation SKU is required',
            'variations.*.sku.distinct' => 'Variation SKUs must be unique',
            'variations.*.price.required' => 'Variation price is required',
            'variations.*.stock_quantity.required' => 'Variation stock quantity is required',
        ];
    }
}
