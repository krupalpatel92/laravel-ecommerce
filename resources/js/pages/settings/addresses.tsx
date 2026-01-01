import HeadingSmall from '@/components/heading-small';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useAddresses } from '@/hooks/use-addresses';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { index } from '@/routes/addresses';
import { type Address } from '@/types/address.types';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { AlertCircle, MapPin, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Address management',
        href: index().url,
    },
];

interface AddressFormData {
    first_name: string;
    last_name: string;
    address_line1: string;
    address_line2: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone: string;
    type: 'shipping' | 'billing';
    is_default: boolean;
}

const emptyFormData: AddressFormData = {
    first_name: '',
    last_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'United States',
    phone: '',
    type: 'shipping',
    is_default: false,
};

export default function Addresses() {
    const { addresses, loading, createAddress, updateAddress, deleteAddress } =
        useAddresses();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [formData, setFormData] = useState<AddressFormData>(emptyFormData);
    const [submitting, setSubmitting] = useState(false);

    const handleOpenDialog = (address?: Address) => {
        if (address) {
            setEditingAddress(address);
            setFormData({
                first_name: address.first_name,
                last_name: address.last_name,
                address_line1: address.address_line1,
                address_line2: address.address_line2 || '',
                city: address.city,
                state: address.state,
                postal_code: address.postal_code,
                country: address.country,
                phone: address.phone,
                type: address.type,
                is_default: address.is_default,
            });
        } else {
            setEditingAddress(null);
            setFormData(emptyFormData);
        }
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingAddress(null);
        setFormData(emptyFormData);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (editingAddress) {
                await updateAddress(editingAddress.id, formData);
                toast.success('Address updated successfully');
            } else {
                await createAddress(formData);
                toast.success('Address created successfully');
            }
            handleCloseDialog();
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || 'Failed to save address',
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (addressId: number) => {
        if (!confirm('Are you sure you want to delete this address?')) {
            return;
        }

        try {
            await deleteAddress(addressId);
            toast.success('Address deleted successfully');
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || 'Failed to delete address',
            );
        }
    };

    const shippingAddresses = addresses.filter((a) => a.type === 'shipping');
    const billingAddresses = addresses.filter((a) => a.type === 'billing');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Address Management" />

            <SettingsLayout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <HeadingSmall
                            title="Address Management"
                            description="Manage your shipping and billing addresses"
                        />
                        <Button onClick={() => handleOpenDialog()}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Address
                        </Button>
                    </div>

                    {loading ? (
                        <div className="text-center text-muted-foreground">
                            Loading addresses...
                        </div>
                    ) : addresses.length === 0 ? (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                You haven't added any addresses yet. Click the
                                "Add Address" button to get started.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <div className="space-y-8">
                            {shippingAddresses.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">
                                        Shipping Addresses
                                    </h3>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {shippingAddresses.map((address) => (
                                            <Card key={address.id}>
                                                <CardContent className="p-4">
                                                    <div className="flex items-start gap-3">
                                                        <MapPin className="mt-1 h-5 w-5 text-muted-foreground" />
                                                        <div className="flex-1 space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-medium">
                                                                    {
                                                                        address.first_name
                                                                    }{' '}
                                                                    {
                                                                        address.last_name
                                                                    }
                                                                </p>
                                                                {address.is_default && (
                                                                    <Badge
                                                                        variant="secondary"
                                                                        className="text-xs"
                                                                    >
                                                                        Default
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">
                                                                {
                                                                    address.address_line1
                                                                }
                                                            </p>
                                                            {address.address_line2 && (
                                                                <p className="text-sm text-muted-foreground">
                                                                    {
                                                                        address.address_line2
                                                                    }
                                                                </p>
                                                            )}
                                                            <p className="text-sm text-muted-foreground">
                                                                {address.city},{' '}
                                                                {address.state}{' '}
                                                                {
                                                                    address.postal_code
                                                                }
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {address.country}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {address.phone}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                                <CardFooter className="flex gap-2 border-t p-4">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1"
                                                        onClick={() =>
                                                            handleOpenDialog(
                                                                address,
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDelete(
                                                                address.id,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </CardFooter>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {billingAddresses.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">
                                        Billing Addresses
                                    </h3>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {billingAddresses.map((address) => (
                                            <Card key={address.id}>
                                                <CardContent className="p-4">
                                                    <div className="flex items-start gap-3">
                                                        <MapPin className="mt-1 h-5 w-5 text-muted-foreground" />
                                                        <div className="flex-1 space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-medium">
                                                                    {
                                                                        address.first_name
                                                                    }{' '}
                                                                    {
                                                                        address.last_name
                                                                    }
                                                                </p>
                                                                {address.is_default && (
                                                                    <Badge
                                                                        variant="secondary"
                                                                        className="text-xs"
                                                                    >
                                                                        Default
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">
                                                                {
                                                                    address.address_line1
                                                                }
                                                            </p>
                                                            {address.address_line2 && (
                                                                <p className="text-sm text-muted-foreground">
                                                                    {
                                                                        address.address_line2
                                                                    }
                                                                </p>
                                                            )}
                                                            <p className="text-sm text-muted-foreground">
                                                                {address.city},{' '}
                                                                {address.state}{' '}
                                                                {
                                                                    address.postal_code
                                                                }
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {address.country}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {address.phone}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                                <CardFooter className="flex gap-2 border-t p-4">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1"
                                                        onClick={() =>
                                                            handleOpenDialog(
                                                                address,
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDelete(
                                                                address.id,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </CardFooter>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
                        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingAddress
                                        ? 'Edit Address'
                                        : 'Add New Address'}
                                </DialogTitle>
                                <DialogDescription>
                                    {editingAddress
                                        ? 'Update your address details below.'
                                        : 'Add a new shipping or billing address.'}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="first_name">
                                            First Name
                                        </Label>
                                        <Input
                                            id="first_name"
                                            value={formData.first_name}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    first_name: e.target.value,
                                                })
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="last_name">
                                            Last Name
                                        </Label>
                                        <Input
                                            id="last_name"
                                            value={formData.last_name}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    last_name: e.target.value,
                                                })
                                            }
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address_line1">
                                        Address Line 1
                                    </Label>
                                    <Input
                                        id="address_line1"
                                        value={formData.address_line1}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                address_line1: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address_line2">
                                        Address Line 2 (Optional)
                                    </Label>
                                    <Input
                                        id="address_line2"
                                        value={formData.address_line2}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                address_line2: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">City</Label>
                                        <Input
                                            id="city"
                                            value={formData.city}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    city: e.target.value,
                                                })
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="state">State</Label>
                                        <Input
                                            id="state"
                                            value={formData.state}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    state: e.target.value,
                                                })
                                            }
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="postal_code">
                                            Postal Code
                                        </Label>
                                        <Input
                                            id="postal_code"
                                            value={formData.postal_code}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    postal_code: e.target.value,
                                                })
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="country">Country</Label>
                                        <Input
                                            id="country"
                                            value={formData.country}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    country: e.target.value,
                                                })
                                            }
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                phone: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="type">Address Type</Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(value: 'shipping' | 'billing') =>
                                            setFormData({
                                                ...formData,
                                                type: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="shipping">
                                                Shipping
                                            </SelectItem>
                                            <SelectItem value="billing">
                                                Billing
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="is_default"
                                        checked={formData.is_default}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                is_default: e.target.checked,
                                            })
                                        }
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <Label htmlFor="is_default" className="cursor-pointer">
                                        Set as default address
                                    </Label>
                                </div>

                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleCloseDialog}
                                        disabled={submitting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={submitting}>
                                        {submitting
                                            ? 'Saving...'
                                            : editingAddress
                                              ? 'Update Address'
                                              : 'Add Address'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
