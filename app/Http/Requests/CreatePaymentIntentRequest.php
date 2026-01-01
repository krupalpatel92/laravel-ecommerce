<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreatePaymentIntentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'cart_id' => ['required', 'integer', 'exists:carts,id'],
            'shipping_address' => ['required', 'array'],
            'shipping_address.first_name' => ['required', 'string', 'max:255'],
            'shipping_address.last_name' => ['required', 'string', 'max:255'],
            'shipping_address.address_line1' => ['required', 'string', 'max:255'],
            'shipping_address.address_line2' => ['nullable', 'string', 'max:255'],
            'shipping_address.city' => ['required', 'string', 'max:255'],
            'shipping_address.state' => ['required', 'string', 'max:255'],
            'shipping_address.postal_code' => ['required', 'string', 'max:20'],
            'shipping_address.country' => ['required', 'string', 'size:2'],
            'shipping_address.phone' => ['required', 'string', 'max:20'],
            'billing_address' => ['required', 'array'],
            'billing_address.first_name' => ['required', 'string', 'max:255'],
            'billing_address.last_name' => ['required', 'string', 'max:255'],
            'billing_address.address_line1' => ['required', 'string', 'max:255'],
            'billing_address.address_line2' => ['nullable', 'string', 'max:255'],
            'billing_address.city' => ['required', 'string', 'max:255'],
            'billing_address.state' => ['required', 'string', 'max:255'],
            'billing_address.postal_code' => ['required', 'string', 'max:20'],
            'billing_address.country' => ['required', 'string', 'size:2'],
            'billing_address.phone' => ['required', 'string', 'max:20'],
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
            'cart_id.required' => 'Cart ID is required.',
            'cart_id.exists' => 'Invalid cart ID.',
            'shipping_address.required' => 'Shipping address is required.',
            'shipping_address.first_name.required' => 'First name is required for shipping address.',
            'shipping_address.last_name.required' => 'Last name is required for shipping address.',
            'shipping_address.address_line1.required' => 'Address line 1 is required for shipping address.',
            'shipping_address.city.required' => 'City is required for shipping address.',
            'shipping_address.state.required' => 'State is required for shipping address.',
            'shipping_address.postal_code.required' => 'Postal code is required for shipping address.',
            'shipping_address.country.required' => 'Country is required for shipping address.',
            'shipping_address.country.size' => 'Country must be a 2-character code.',
            'shipping_address.phone.required' => 'Phone number is required for shipping address.',
            'billing_address.required' => 'Billing address is required.',
            'billing_address.first_name.required' => 'First name is required for billing address.',
            'billing_address.last_name.required' => 'Last name is required for billing address.',
            'billing_address.address_line1.required' => 'Address line 1 is required for billing address.',
            'billing_address.city.required' => 'City is required for billing address.',
            'billing_address.state.required' => 'State is required for billing address.',
            'billing_address.postal_code.required' => 'Postal code is required for billing address.',
            'billing_address.country.required' => 'Country is required for billing address.',
            'billing_address.country.size' => 'Country must be a 2-character code.',
            'billing_address.phone.required' => 'Phone number is required for billing address.',
        ];
    }
}
