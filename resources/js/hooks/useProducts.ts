import {
    useMutation,
    useQuery,
    useQueryClient,
    type UseQueryOptions,
} from '@tanstack/react-query';
import { ProductsService } from '@/sdk';
import type { Product } from '@/sdk/models/Product';

export interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
}

export interface CreateProductInput {
    name: string;
    description?: string | null;
    type: 'single' | 'variable';
    price: number;
    stock_quantity: number;
    alert_threshold?: number;
    status: 'draft' | 'published' | 'archived';
    category_ids?: number[];
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
    id: number;
}

export interface ProductsResponse {
    data?: Product[];
    links?: Record<string, any>;
    meta?: Record<string, any>;
}

export interface ProductsParams {
    page?: number;
    per_page?: number;
    status?: 'draft' | 'published' | 'archived';
    type?: 'single' | 'variable';
    search?: string;
}

export function useProducts(
    params?: ProductsParams,
    options?: Omit<
        UseQueryOptions<ProductsResponse>,
        'queryKey' | 'queryFn'
    >,
) {
    return useQuery<ProductsResponse>({
        queryKey: ['products', params],
        queryFn: () =>
            ProductsService.getAll(
                params?.page,
                params?.per_page,
                params?.status,
                params?.type,
                params?.search,
            ),
        ...options,
    });
}

export function useProduct(
    id: number,
    options?: Omit<UseQueryOptions<Product>, 'queryKey' | 'queryFn'>,
) {
    return useQuery<Product>({
        queryKey: ['products', id],
        queryFn: () => ProductsService.getSingle(id),
        enabled: !!id,
        ...options,
    });
}

export function useCreateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateProductInput) =>
            ProductsService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}

export function useUpdateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, ...data }: UpdateProductInput) =>
            ProductsService.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({
                queryKey: ['products', variables.id],
            });
        },
    });
}

export function useDeleteProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => ProductsService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}
