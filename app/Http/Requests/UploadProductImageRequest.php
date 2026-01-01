<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadProductImageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('manage-products');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'images' => ['required', 'array', 'max:10'],
            'images.*' => [
                'required',
                'image',
                'mimes:jpeg,jpg,png,webp',
                'max:5120', // 5MB
                'dimensions:min_width=400,min_height=400,max_width=4000,max_height=4000',
            ],
        ];
    }

    /**
     * Get custom error messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'images.required' => 'At least one image is required',
            'images.max' => 'You can upload a maximum of 10 images',
            'images.*.required' => 'Each image file is required',
            'images.*.image' => 'Each file must be an image',
            'images.*.mimes' => 'Images must be jpeg, jpg, png, or webp format',
            'images.*.max' => 'Each image must not exceed 5MB',
            'images.*.dimensions' => 'Images must be between 400x400px and 4000x4000px',
        ];
    }
}
