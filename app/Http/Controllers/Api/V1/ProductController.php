<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Actions\Product\CreateProductAction;
use App\Actions\Product\DeleteProductAction;
use App\Actions\Product\UpdateProductAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\CreateProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use OpenApi\Attributes as OA;

class ProductController extends Controller
{
    #[OA\Get(
        path: '/products',
        operationId: 'getAll',
        summary: 'List all products',
        security: [['sanctum' => []]],
        tags: ['Products']
    )]
    #[OA\Parameter(
        name: 'page',
        in: 'query',
        description: 'Page number',
        required: false,
        schema: new OA\Schema(type: 'integer', example: 1)
    )]
    #[OA\Parameter(
        name: 'per_page',
        in: 'query',
        description: 'Items per page',
        required: false,
        schema: new OA\Schema(type: 'integer', example: 15)
    )]
    #[OA\Parameter(
        name: 'status',
        in: 'query',
        description: 'Filter by status',
        required: false,
        schema: new OA\Schema(type: 'string', enum: ['draft', 'published', 'archived'])
    )]
    #[OA\Parameter(
        name: 'type',
        in: 'query',
        description: 'Filter by type',
        required: false,
        schema: new OA\Schema(type: 'string', enum: ['single', 'variable'])
    )]
    #[OA\Parameter(
        name: 'search',
        in: 'query',
        description: 'Search by name',
        required: false,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\Response(
        response: 200,
        description: 'Successful response',
        content: new OA\JsonContent(
            type: 'object',
            properties: [
                new OA\Property(property: 'data', type: 'array', items: new OA\Items(ref: '#/components/schemas/Product')),
                new OA\Property(property: 'links', type: 'object'),
                new OA\Property(property: 'meta', type: 'object'),
            ]
        )
    )]
    #[OA\Response(response: 401, description: 'Unauthenticated')]
    #[OA\Response(response: 403, description: 'Forbidden')]
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Product::query()->with('categories');

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
        $products = $query->paginate($perPage);

        return ProductResource::collection($products);
    }

    #[OA\Post(
        path: '/products',
        operationId: 'create',
        summary: 'Create a new product',
        security: [['sanctum' => []]],
        tags: ['Products']
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ['name', 'type', 'price', 'stock_quantity', 'status'],
            properties: [
                new OA\Property(property: 'name', type: 'string', example: 'Product Name'),
                new OA\Property(property: 'description', type: 'string', nullable: true),
                new OA\Property(property: 'type', type: 'string', enum: ['single', 'variable']),
                new OA\Property(property: 'price', type: 'number', format: 'float', example: 99.99),
                new OA\Property(property: 'stock_quantity', type: 'integer', example: 100),
                new OA\Property(property: 'alert_threshold', type: 'integer', example: 10),
                new OA\Property(property: 'status', type: 'string', enum: ['draft', 'published', 'archived']),
                new OA\Property(property: 'category_ids', type: 'array', items: new OA\Items(type: 'integer')),
            ]
        )
    )]
    #[OA\Response(
        response: 201,
        description: 'Product created successfully',
        content: new OA\JsonContent(ref: '#/components/schemas/Product')
    )]
    #[OA\Response(response: 401, description: 'Unauthenticated')]
    #[OA\Response(response: 403, description: 'Forbidden')]
    #[OA\Response(response: 422, description: 'Validation error')]
    public function store(CreateProductRequest $request, CreateProductAction $action): ProductResource
    {
        $product = $action->execute($request->validated());

        return new ProductResource($product);
    }

    #[OA\Get(
        path: '/products/{id}',
        operationId: 'getSingle',
        summary: 'Get a single product',
        security: [['sanctum' => []]],
        tags: ['Products']
    )]
    #[OA\Parameter(
        name: 'id',
        in: 'path',
        description: 'Product ID',
        required: true,
        schema: new OA\Schema(type: 'integer')
    )]
    #[OA\Response(
        response: 200,
        description: 'Successful response',
        content: new OA\JsonContent(ref: '#/components/schemas/Product')
    )]
    #[OA\Response(response: 401, description: 'Unauthenticated')]
    #[OA\Response(response: 403, description: 'Forbidden')]
    #[OA\Response(response: 404, description: 'Product not found')]
    public function show(Product $product): ProductResource
    {
        $product->load(['categories', 'variations', 'media']);

        return new ProductResource($product);
    }

    #[OA\Put(
        path: '/products/{id}',
        operationId: 'update',
        summary: 'Update a product',
        security: [['sanctum' => []]],
        tags: ['Products']
    )]
    #[OA\Parameter(
        name: 'id',
        in: 'path',
        description: 'Product ID',
        required: true,
        schema: new OA\Schema(type: 'integer')
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'name', type: 'string'),
                new OA\Property(property: 'description', type: 'string', nullable: true),
                new OA\Property(property: 'type', type: 'string', enum: ['single', 'variable']),
                new OA\Property(property: 'price', type: 'number', format: 'float'),
                new OA\Property(property: 'stock_quantity', type: 'integer'),
                new OA\Property(property: 'alert_threshold', type: 'integer'),
                new OA\Property(property: 'status', type: 'string', enum: ['draft', 'published', 'archived']),
                new OA\Property(property: 'category_ids', type: 'array', items: new OA\Items(type: 'integer')),
            ]
        )
    )]
    #[OA\Response(
        response: 200,
        description: 'Product updated successfully',
        content: new OA\JsonContent(ref: '#/components/schemas/Product')
    )]
    #[OA\Response(response: 401, description: 'Unauthenticated')]
    #[OA\Response(response: 403, description: 'Forbidden')]
    #[OA\Response(response: 404, description: 'Product not found')]
    #[OA\Response(response: 422, description: 'Validation error')]
    public function update(UpdateProductRequest $request, Product $product, UpdateProductAction $action): ProductResource
    {
        $product = $action->execute($product, $request->validated());

        return new ProductResource($product);
    }

    #[OA\Delete(
        path: '/products/{id}',
        operationId: 'delete',
        summary: 'Delete a product',
        security: [['sanctum' => []]],
        tags: ['Products']
    )]
    #[OA\Parameter(
        name: 'id',
        in: 'path',
        description: 'Product ID',
        required: true,
        schema: new OA\Schema(type: 'integer')
    )]
    #[OA\Response(response: 204, description: 'Product deleted successfully')]
    #[OA\Response(response: 401, description: 'Unauthenticated')]
    #[OA\Response(response: 403, description: 'Forbidden')]
    #[OA\Response(response: 404, description: 'Product not found')]
    #[OA\Response(response: 422, description: 'Cannot delete product with existing orders')]
    public function destroy(Product $product, DeleteProductAction $action): JsonResponse
    {
        $action->execute($product);

        return response()->json(null, 204);
    }
}

#[OA\Schema(
    schema: 'Product',
    type: 'object',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'name', type: 'string', example: 'Product Name'),
        new OA\Property(property: 'slug', type: 'string', example: 'product-name'),
        new OA\Property(property: 'description', type: 'string', nullable: true),
        new OA\Property(property: 'type', type: 'string', enum: ['single', 'variable']),
        new OA\Property(property: 'price', type: 'number', format: 'float', example: 99.99),
        new OA\Property(property: 'stock_quantity', type: 'integer', example: 100),
        new OA\Property(property: 'alert_threshold', type: 'integer', example: 10),
        new OA\Property(property: 'status', type: 'string', enum: ['draft', 'published', 'archived']),
        new OA\Property(property: 'is_low_stock', type: 'boolean'),
        new OA\Property(property: 'is_out_of_stock', type: 'boolean'),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time'),
    ]
)]
class ProductSchema {}
