<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Actions\Category\CreateCategoryAction;
use App\Actions\Category\DeleteCategoryAction;
use App\Actions\Category\UpdateCategoryAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\CreateCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(): Response
    {
        $categories = Category::query()
            ->with(['parent', 'children'])
            ->withCount('products')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/categories/index', [
            'categories' => $categories,
        ]);
    }

    public function create(): Response
    {
        $categories = Category::query()
            ->whereNull('parent_id')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/categories/create', [
            'parentCategories' => $categories,
        ]);
    }

    public function store(CreateCategoryRequest $request, CreateCategoryAction $action): RedirectResponse
    {
        $category = $action->execute($request->validated());

        return redirect()
            ->route('admin.categories.index')
            ->with('success', "Category '{$category->name}' created successfully");
    }

    public function edit(Category $category): Response
    {
        $categories = Category::query()
            ->whereNull('parent_id')
            ->where('id', '!=', $category->id)
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/categories/edit', [
            'category' => $category->load(['parent', 'children']),
            'parentCategories' => $categories,
        ]);
    }

    public function update(
        UpdateCategoryRequest $request,
        Category $category,
        UpdateCategoryAction $action
    ): RedirectResponse {
        $category = $action->execute($category, $request->validated());

        return redirect()
            ->route('admin.categories.index')
            ->with('success', "Category '{$category->name}' updated successfully");
    }

    public function destroy(Category $category, DeleteCategoryAction $action): RedirectResponse
    {
        try {
            $action->execute($category);

            return redirect()
                ->route('admin.categories.index')
                ->with('success', 'Category deleted successfully');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()
                ->back()
                ->withErrors($e->errors());
        }
    }
}
