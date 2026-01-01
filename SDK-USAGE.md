# SDK Usage Guide

## Overview

This guide explains how to use the auto-generated TypeScript SDK with TanStack Query for type-safe API calls in React components.

## Architecture

```
Laravel API (Swagger Annotations)
    ↓
L5-Swagger → OpenAPI 3.0 Spec (JSON)
    ↓
openapi-typescript-codegen → TypeScript SDK
    ↓
React Hooks + TanStack Query + Axios → Type-safe API calls
```

## SDK Generation

The SDK auto-generates on every `npm run dev` and `npm run build`.

### Automatic Generation (Safe Mode)

```bash
npm run generate-sdk
```

This command uses a smart wrapper script that:
1. Checks if Laravel server is running at `http://localhost:8888`
2. If available: Fetches OpenAPI spec and generates TypeScript SDK
3. If not available: Skips generation gracefully (won't break your build)

### Manual Generation (Force Mode)

If you need to regenerate the SDK after the Laravel server is already running:

```bash
npm run generate-sdk:force
```

This command:
1. Fetches OpenAPI spec from `http://localhost:8888/api/documentation/json`
2. Generates TypeScript SDK in `resources/js/sdk/`
3. Creates type-safe models and services
4. **Requires Laravel server to be running**

## File Structure

```
resources/js/
├── sdk/                    # Auto-generated (gitignored)
│   ├── core/              # HTTP client
│   ├── models/            # TypeScript interfaces
│   ├── services/          # API services
│   └── index.ts           # Main exports
├── lib/
│   ├── queryClient.ts     # TanStack Query client config
│   └── api.ts             # Axios instance with interceptors
└── hooks/
    └── useProducts.ts     # TanStack Query hooks
```

## Configuration Files

### QueryClient (`resources/js/lib/queryClient.ts`)

Configures TanStack Query with:
- **staleTime**: 5 minutes
- **gcTime**: 10 minutes
- **retry**: 1 attempt
- **refetchOnWindowFocus**: disabled

### API Client (`resources/js/lib/api.ts`)

Axios instance with:
- Base URL: `/api/v1`
- Request interceptor: Adds bearer token from localStorage
- Response interceptor: Handles 401 (redirects to login)
- Credentials: Included for CSRF

## Using the Hooks

### List Products

```tsx
import { useProducts } from '@/hooks/useProducts';

function ProductsList() {
    const { data, isLoading, error } = useProducts({
        page: 1,
        per_page: 10,
        status: 'published',
    });

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div>
            {data?.data.map((product) => (
                <div key={product.id}>{product.name}</div>
            ))}
        </div>
    );
}
```

### Get Single Product

```tsx
import { useProduct } from '@/hooks/useProducts';

function ProductDetail({ productId }: { productId: number }) {
    const { data: product, isLoading } = useProduct(productId);

    if (isLoading) return <div>Loading...</div>;

    return <div>{product?.name}</div>;
}
```

### Create Product

```tsx
import { useCreateProduct } from '@/hooks/useProducts';

function CreateProductForm() {
    const createProduct = useCreateProduct();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await createProduct.mutateAsync({
                name: 'New Product',
                type: 'single',
                price: 99.99,
                stock_quantity: 100,
                status: 'draft',
            });
        } catch (error) {
            console.error('Failed to create product:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <button disabled={createProduct.isPending}>
                {createProduct.isPending ? 'Creating...' : 'Create Product'}
            </button>
        </form>
    );
}
```

### Update Product

```tsx
import { useUpdateProduct } from '@/hooks/useProducts';

function EditProductForm({ productId }: { productId: number }) {
    const updateProduct = useUpdateProduct();

    const handleUpdate = async () => {
        await updateProduct.mutateAsync({
            id: productId,
            name: 'Updated Name',
            price: 149.99,
        });
    };

    return (
        <button onClick={handleUpdate} disabled={updateProduct.isPending}>
            {updateProduct.isPending ? 'Updating...' : 'Update Product'}
        </button>
    );
}
```

### Delete Product

```tsx
import { useDeleteProduct } from '@/hooks/useProducts';

function DeleteProductButton({ productId }: { productId: number }) {
    const deleteProduct = useDeleteProduct();

    const handleDelete = async () => {
        if (confirm('Are you sure?')) {
            await deleteProduct.mutateAsync(productId);
        }
    };

    return (
        <button onClick={handleDelete} disabled={deleteProduct.isPending}>
            {deleteProduct.isPending ? 'Deleting...' : 'Delete'}
        </button>
    );
}
```

## Error Handling

### Using Error States

```tsx
const { data, error, isError } = useProducts();

if (isError) {
    return <div>Error: {error.message}</div>;
}
```

### Using Try-Catch

```tsx
const createProduct = useCreateProduct();

try {
    await createProduct.mutateAsync(data);
} catch (error) {
    if (axios.isAxiosError(error)) {
        console.error('API Error:', error.response?.data);
    }
}
```

## Cache Management

### Automatic Invalidation

Mutations automatically invalidate related queries:

```tsx
// After creating a product, useProducts queries are invalidated
const createProduct = useCreateProduct();
await createProduct.mutateAsync(data);
// All useProducts queries will refetch
```

### Manual Invalidation

```tsx
import { useQueryClient } from '@tanstack/react-query';

function MyComponent() {
    const queryClient = useQueryClient();

    const refreshProducts = () => {
        queryClient.invalidateQueries({ queryKey: ['products'] });
    };

    return <button onClick={refreshProducts}>Refresh</button>;
}
```

## TypeScript Types

All types are auto-generated from the API and available in hooks:

```tsx
import type { Product, CreateProductInput } from '@/hooks/useProducts';

const product: Product = {
    id: 1,
    name: 'Example',
    type: 'single',
    // ... full type safety
};
```

## Best Practices

1. **Use the hooks** instead of calling the API directly
2. **Let TanStack Query handle caching** - don't store API data in component state
3. **Use optimistic updates** for better UX:

```tsx
const updateProduct = useUpdateProduct();

await updateProduct.mutateAsync(data, {
    onMutate: async (newProduct) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries({ queryKey: ['products'] });

        // Snapshot previous value
        const previousProducts = queryClient.getQueryData(['products']);

        // Optimistically update
        queryClient.setQueryData(['products'], (old) => {
            // Update logic
        });

        return { previousProducts };
    },
    onError: (err, newProduct, context) => {
        // Rollback on error
        queryClient.setQueryData(['products'], context?.previousProducts);
    },
});
```

4. **Handle loading and error states** consistently
5. **Use proper TypeScript types** from the hooks

## Debugging

### Check if SDK is generated

```bash
ls -la resources/js/sdk/
```

### Regenerate SDK

```bash
npm run generate-sdk
```

### View OpenAPI spec

Visit: `http://localhost:8888/api/documentation/json`

## Common Issues

### SDK not generating

Check if:
1. Laravel server is running (`php artisan serve`)
2. Swagger docs are generated (`php artisan l5-swagger:generate`)
3. OpenAPI spec is accessible at `/api/documentation/json`

### 401 Unauthorized

Make sure:
1. User is authenticated
2. Token is stored in localStorage as `auth_token`
3. Sanctum middleware is applied to routes

### TypeScript errors

Run:
```bash
npm run types
```

To check for type errors without compilation.
