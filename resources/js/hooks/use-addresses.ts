import { apiClient } from '@/lib/api';
import { Address } from '@/types/address.types';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

interface UseAddressesReturn {
    addresses: Address[];
    isLoading: boolean;
    error: string | null;
    fetchAddresses: () => Promise<void>;
    saveAddress: (address: Omit<Address, 'id'>) => Promise<Address | null>;
    updateAddress: (id: number, address: Address) => Promise<Address | null>;
    deleteAddress: (id: number) => Promise<void>;
    setDefaultAddress: (id: number) => Promise<void>;
}

export function useAddresses(): UseAddressesReturn {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAddresses = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient.get('/addresses');
            setAddresses(response.data.data || []);
        } catch (err) {
            const message = 'Failed to load addresses';
            setError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const saveAddress = useCallback(
        async (address: Omit<Address, 'id'>): Promise<Address | null> => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await apiClient.post('/addresses', address);
                const newAddress = response.data.data;

                setAddresses((prev) => [...prev, newAddress]);
                toast.success('Address saved successfully');

                return newAddress;
            } catch (err) {
                const message = 'Failed to save address';
                setError(message);
                toast.error(message);
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        [],
    );

    const updateAddress = useCallback(
        async (id: number, address: Address): Promise<Address | null> => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await apiClient.put(`/addresses/${id}`, address);
                const updatedAddress = response.data.data;

                setAddresses((prev) =>
                    prev.map((addr) =>
                        addr.id === id ? updatedAddress : addr,
                    ),
                );
                toast.success('Address updated successfully');

                return updatedAddress;
            } catch (err) {
                const message = 'Failed to update address';
                setError(message);
                toast.error(message);
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        [],
    );

    const deleteAddress = useCallback(async (id: number): Promise<void> => {
        setIsLoading(true);
        setError(null);
        try {
            await apiClient.delete(`/addresses/${id}`);

            setAddresses((prev) => prev.filter((addr) => addr.id !== id));
            toast.success('Address deleted successfully');
        } catch (err) {
            const message = 'Failed to delete address';
            setError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const setDefaultAddress = useCallback(
        async (id: number): Promise<void> => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await apiClient.put(`/addresses/${id}/set-default`);
                const defaultAddress = response.data.data;

                setAddresses((prev) =>
                    prev.map((addr) => ({
                        ...addr,
                        is_default: addr.id === id,
                    })),
                );
                toast.success('Default address updated');
            } catch (err) {
                const message = 'Failed to set default address';
                setError(message);
                toast.error(message);
            } finally {
                setIsLoading(false);
            }
        },
        [],
    );

    return {
        addresses,
        isLoading,
        error,
        fetchAddresses,
        saveAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
    };
}
