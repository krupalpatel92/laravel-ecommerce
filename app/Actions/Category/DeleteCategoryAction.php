<?php

declare(strict_types=1);

namespace App\Actions\Category;

use App\Models\Category;
use Illuminate\Validation\ValidationException;

class DeleteCategoryAction
{
    public function execute(Category $category): bool
    {
        // Check if category has products
        if ($category->products()->exists()) {
            throw ValidationException::withMessages([
                'category' => 'Cannot delete category with associated products',
            ]);
        }

        return $category->delete();
    }
}
