import { useState, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ProductSearchProps {
    initialValue?: string;
}

export function ProductSearch({ initialValue = '' }: ProductSearchProps) {
    const [search, setSearch] = useState(initialValue);

    const performSearch = useCallback((value: string) => {
        router.get(
            '/products',
            { search: value || undefined },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== initialValue) {
                performSearch(search);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [search, initialValue, performSearch]);

    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
            />
        </div>
    );
}
