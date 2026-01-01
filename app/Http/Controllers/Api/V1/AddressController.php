<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAddressRequest;
use App\Http\Requests\UpdateAddressRequest;
use App\Http\Resources\AddressResource;
use App\Models\Address;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class AddressController extends Controller
{
    /**
     * Display a listing of the user's addresses.
     */
    public function index(): AnonymousResourceCollection
    {
        $addresses = Address::query()
            ->forUser(auth()->id())
            ->orderBy('is_default', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return AddressResource::collection($addresses);
    }

    /**
     * Store a newly created address in storage.
     */
    public function store(StoreAddressRequest $request): JsonResponse
    {
        try {
            DB::beginTransaction();

            $validated = $request->validated();

            if ($validated['is_default'] ?? false) {
                Address::forUser(auth()->id())
                    ->where('type', $validated['type'])
                    ->update(['is_default' => false]);
            }

            $address = Address::create($validated);

            DB::commit();

            return response()->json([
                'message' => 'Address created successfully.',
                'data' => new AddressResource($address),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Failed to create address.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified address.
     */
    public function show(Address $address): AddressResource
    {
        $this->authorize('view', $address);

        return new AddressResource($address);
    }

    /**
     * Update the specified address in storage.
     */
    public function update(UpdateAddressRequest $request, Address $address): JsonResponse
    {
        try {
            DB::beginTransaction();

            $validated = $request->validated();

            if (isset($validated['is_default']) && $validated['is_default']) {
                Address::forUser(auth()->id())
                    ->where('type', $address->type)
                    ->where('id', '!=', $address->id)
                    ->update(['is_default' => false]);
            }

            $address->update($validated);

            DB::commit();

            return response()->json([
                'message' => 'Address updated successfully.',
                'data' => new AddressResource($address->fresh()),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Failed to update address.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified address from storage.
     */
    public function destroy(Address $address): JsonResponse
    {
        $this->authorize('delete', $address);

        try {
            $address->delete();

            return response()->json([
                'message' => 'Address deleted successfully.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete address.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Set the specified address as default.
     */
    public function setDefault(Address $address): JsonResponse
    {
        $this->authorize('update', $address);

        try {
            DB::beginTransaction();

            Address::forUser(auth()->id())
                ->where('type', $address->type)
                ->where('id', '!=', $address->id)
                ->update(['is_default' => false]);

            $address->update(['is_default' => true]);

            DB::commit();

            return response()->json([
                'message' => 'Default address updated successfully.',
                'data' => new AddressResource($address->fresh()),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Failed to set default address.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
