<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Actions\Product\CreateProductAction;
use App\Actions\Product\DeleteProductAction;
use App\Actions\Product\UpdateProductAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\CreateProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Product::query()->with(['categories.parent', 'variations']);

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('type')) {
            $query->where('type', $request->input('type'));
        }

        if ($request->has('search')) {
            $query->where('name', 'like', '%'.$request->input('search').'%');
        }

        $perPage = $request->input('per_page', 15);
        $products = $query->latest()->paginate($perPage);

        // Transform products with primary image URLs
        $products->getCollection()->transform(function ($product) {
            $productData = $product->toArray();
            $productData['primary_image_url'] = $product->getPrimaryImageUrl();
            $productData['primary_image_thumb_url'] = $product->getPrimaryImageUrl('thumb');
            $productData['primary_image_medium_url'] = $product->getPrimaryImageUrl('medium');

            return $productData;
        });

        return Inertia::render('admin/products/index', [
            'products' => $products,
            'filters' => [
                'search' => $request->input('search'),
                'status' => $request->input('status'),
                'type' => $request->input('type'),
                'page' => $request->input('page', 1),
            ],
        ]);
    }

    public function create(): Response
    {
        $categories = Category::query()
            ->with('parent')
            ->where('is_active', true)
            ->orderByRaw('COALESCE(parent_id, id), parent_id IS NOT NULL, name')
            ->get(['id', 'name', 'slug', 'parent_id']);

        return Inertia::render('admin/products/create', [
            'categories' => $categories,
        ]);
    }

    public function store(CreateProductRequest $request, CreateProductAction $action): RedirectResponse
    {
        $product = $action->execute($request->validated());

        return redirect()
            ->route('admin.products.index')
            ->with('success', 'Product created successfully.');
    }

    public function edit(Product $product): Response
    {
        $product->load(['categories', 'variations', 'media']);

        $categories = Category::query()
            ->with('parent')
            ->where('is_active', true)
            ->orderByRaw('COALESCE(parent_id, id), parent_id IS NOT NULL, name')
            ->get(['id', 'name', 'slug', 'parent_id']);

        // Transform media for frontend
        $productData = $product->toArray();
        $productData['media'] = $product->getMedia('product-images')->map(function ($media) {
            return [
                'id' => $media->id,
                'product_id' => $media->model_id,
                'file_name' => $media->file_name,
                'url' => $media->getUrl(),
                'thumb_url' => $media->getUrl('thumb'),
                'medium_url' => $media->getUrl('medium'),
                'is_primary' => $media->getCustomProperty('is_primary', false),
                'order' => $media->order_column,
            ];
        })->toArray();

        return Inertia::render('admin/products/edit', [
            'product' => $productData,
            'categories' => $categories,
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product, UpdateProductAction $action): RedirectResponse
    {
        $action->execute($product, $request->validated());

        return redirect()
            ->route('admin.products.index')
            ->with('success', 'Product updated successfully.');
    }

    public function destroy(Product $product, DeleteProductAction $action): RedirectResponse
    {
        $action->execute($product);

        return redirect()
            ->route('admin.products.index')
            ->with('success', 'Product deleted successfully.');
    }
}
