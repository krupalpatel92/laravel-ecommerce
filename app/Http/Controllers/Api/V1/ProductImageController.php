<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Actions\ProductImage\DeleteProductImageAction;
use App\Actions\ProductImage\ReorderProductImagesAction;
use App\Actions\ProductImage\SetPrimaryImageAction;
use App\Actions\ProductImage\UploadProductImageAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\ReorderProductImagesRequest;
use App\Http\Requests\UploadProductImageRequest;
use App\Http\Resources\MediaResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * @OA\Tag(
 *     name="Product Images",
 *     description="Product image management endpoints"
 * )
 */
class ProductImageController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/v1/products/{product}/images",
     *     operationId="uploadProductImages",
     *     tags={"Product Images"},
     *     summary="Upload product images",
     *     description="Upload one or more images for a product",
     *     security={{"sanctum":{}}},
     *
     *     @OA\Parameter(
     *         name="product",
     *         in="path",
     *         required=true,
     *         description="Product ID",
     *
     *         @OA\Schema(type="integer")
     *     ),
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *
     *             @OA\Schema(
     *                 required={"images"},
     *
     *                 @OA\Property(
     *                     property="images[]",
     *                     type="array",
     *
     *                     @OA\Items(type="string", format="binary")
     *                 )
     *             )
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=201,
     *         description="Images uploaded successfully",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Media"))
     *         )
     *     ),
     *
     *     @OA\Response(response=422, description="Validation error"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function store(
        UploadProductImageRequest $request,
        Product $product,
        UploadProductImageAction $action
    ): AnonymousResourceCollection {
        $media = $action->execute($product, $request->file('images'));

        return MediaResource::collection($media);
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/products/{product}/images/{media}",
     *     operationId="deleteProductImage",
     *     tags={"Product Images"},
     *     summary="Delete a product image",
     *     description="Delete a specific product image",
     *     security={{"sanctum":{}}},
     *
     *     @OA\Parameter(
     *         name="product",
     *         in="path",
     *         required=true,
     *         description="Product ID",
     *
     *         @OA\Schema(type="integer")
     *     ),
     *
     *     @OA\Parameter(
     *         name="media",
     *         in="path",
     *         required=true,
     *         description="Media ID",
     *
     *         @OA\Schema(type="integer")
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Image deleted successfully",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="message", type="string", example="Image deleted successfully")
     *         )
     *     ),
     *
     *     @OA\Response(response=404, description="Image not found"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function destroy(
        Product $product,
        int $media,
        DeleteProductImageAction $action
    ): JsonResponse {
        $deleted = $action->execute($product, $media);

        if (! $deleted) {
            return response()->json([
                'message' => 'Image not found',
            ], 404);
        }

        return response()->json([
            'message' => 'Image deleted successfully',
        ]);
    }

    /**
     * @OA\Put(
     *     path="/api/v1/products/{product}/images/{media}/primary",
     *     operationId="setPrimaryProductImage",
     *     tags={"Product Images"},
     *     summary="Set primary product image",
     *     description="Set a specific image as the primary product image",
     *     security={{"sanctum":{}}},
     *
     *     @OA\Parameter(
     *         name="product",
     *         in="path",
     *         required=true,
     *         description="Product ID",
     *
     *         @OA\Schema(type="integer")
     *     ),
     *
     *     @OA\Parameter(
     *         name="media",
     *         in="path",
     *         required=true,
     *         description="Media ID",
     *
     *         @OA\Schema(type="integer")
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Primary image set successfully",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="message", type="string", example="Primary image set successfully")
     *         )
     *     ),
     *
     *     @OA\Response(response=404, description="Image not found"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function setPrimary(
        Product $product,
        int $media,
        SetPrimaryImageAction $action
    ): JsonResponse {
        $success = $action->execute($product, $media);

        if (! $success) {
            return response()->json([
                'message' => 'Image not found',
            ], 404);
        }

        return response()->json([
            'message' => 'Primary image set successfully',
        ]);
    }

    /**
     * @OA\Put(
     *     path="/api/v1/products/{product}/images/reorder",
     *     operationId="reorderProductImages",
     *     tags={"Product Images"},
     *     summary="Reorder product images",
     *     description="Change the order of product images",
     *     security={{"sanctum":{}}},
     *
     *     @OA\Parameter(
     *         name="product",
     *         in="path",
     *         required=true,
     *         description="Product ID",
     *
     *         @OA\Schema(type="integer")
     *     ),
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *             required={"order"},
     *
     *             @OA\Property(
     *                 property="order",
     *                 type="array",
     *
     *                 @OA\Items(type="integer"),
     *                 example={3, 1, 2}
     *             )
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Images reordered successfully",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="message", type="string", example="Images reordered successfully")
     *         )
     *     ),
     *
     *     @OA\Response(response=422, description="Validation error"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function reorder(
        ReorderProductImagesRequest $request,
        Product $product,
        ReorderProductImagesAction $action
    ): JsonResponse {
        $action->execute($product, $request->validated('order'));

        return response()->json([
            'message' => 'Images reordered successfully',
        ]);
    }
}
