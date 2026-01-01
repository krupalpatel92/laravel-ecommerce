<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Category;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage-products') ?? false;
    }

    public function rules(): array
    {
        $category = $this->route('category');

        return [
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('categories', 'name')->ignore($category instanceof Category ? $category->id : $category),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
            'parent_id' => [
                'nullable',
                'integer',
                'exists:categories,id',
                function ($attribute, $value, $fail) use ($category) {
                    if (! $category instanceof Category) {
                        return;
                    }

                    // Prevent setting self as parent
                    if ($value == $category->id) {
                        $fail('A category cannot be its own parent');
                    }

                    // Prevent circular relationships (setting descendant as parent)
                    if ($value && $this->isDescendant($category->id, $value)) {
                        $fail('Cannot set a child category as parent');
                    }
                },
            ],
            'is_active' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Category name is required',
            'name.unique' => 'A category with this name already exists',
            'name.max' => 'Category name cannot exceed 255 characters',
            'description.max' => 'Description cannot exceed 1000 characters',
            'parent_id.exists' => 'Selected parent category does not exist',
        ];
    }

    protected function isDescendant(int $categoryId, int $potentialParentId): bool
    {
        $category = Category::find($potentialParentId);

        if (! $category) {
            return false;
        }

        // Check if the potential parent is a descendant
        while ($category) {
            if ($category->parent_id == $categoryId) {
                return true;
            }
            $category = $category->parent;
        }

        return false;
    }
}
