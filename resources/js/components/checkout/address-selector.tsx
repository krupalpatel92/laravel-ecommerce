import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Address } from '@/types/address.types';
import { Plus } from 'lucide-react';

interface AddressSelectorProps {
    addresses: Address[];
    selectedAddressId?: number;
    onSelect: (address: Address | 'new') => void;
    type: 'shipping' | 'billing';
}

export default function AddressSelector({
    addresses,
    selectedAddressId,
    onSelect,
    type,
}: AddressSelectorProps) {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">
                Select {type === 'shipping' ? 'Shipping' : 'Billing'} Address
            </h3>

            {addresses.length === 0 ? (
                <div className="text-center text-muted-foreground">
                    <p>No saved addresses found.</p>
                    <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => onSelect('new')}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Address
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {addresses.map((address) => (
                        <Card
                            key={address.id}
                            className={cn(
                                'cursor-pointer transition-colors hover:border-primary',
                                selectedAddressId === address.id &&
                                    'border-primary ring-2 ring-primary/20',
                            )}
                            onClick={() => onSelect(address)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <input
                                        type="radio"
                                        checked={
                                            selectedAddressId === address.id
                                        }
                                        onChange={() => onSelect(address)}
                                        className="mt-1"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <div className="flex-1 space-y-1">
                                        <p className="font-medium">
                                            {address.first_name}{' '}
                                            {address.last_name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {address.address_line1}
                                        </p>
                                        {address.address_line2 && (
                                            <p className="text-sm text-muted-foreground">
                                                {address.address_line2}
                                            </p>
                                        )}
                                        <p className="text-sm text-muted-foreground">
                                            {address.city}, {address.state}{' '}
                                            {address.postal_code}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {address.country}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {address.phone}
                                        </p>
                                        {address.is_default && (
                                            <Badge
                                                variant="secondary"
                                                className="mt-2"
                                            >
                                                Default
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Add new address option */}
                    <Card
                        className="cursor-pointer border-dashed transition-colors hover:border-primary"
                        onClick={() => onSelect('new')}
                    >
                        <CardContent className="flex h-full min-h-[200px] items-center justify-center p-4">
                            <div className="text-center">
                                <Plus className="mx-auto h-8 w-8 text-muted-foreground" />
                                <p className="mt-2 text-sm font-medium">
                                    Add New Address
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
