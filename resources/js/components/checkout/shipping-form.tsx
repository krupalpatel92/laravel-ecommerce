import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Address } from '@/types/address.types';
import { Loader2 } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

interface ShippingFormProps {
    initialAddress?: Address;
    onSubmit: (address: Address, saveAddress?: boolean) => void;
    onCancel?: () => void;
    showSaveAddress?: boolean;
}

// Sample countries - in production, this should come from API
const COUNTRIES = [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'AU', name: 'Australia' },
];

// Sample states - in production, this should be filtered by country from API
const US_STATES = [
    { code: 'CA', name: 'California' },
    { code: 'NY', name: 'New York' },
    { code: 'TX', name: 'Texas' },
    { code: 'FL', name: 'Florida' },
];

export default function ShippingForm({
    initialAddress,
    onSubmit,
    onCancel,
    showSaveAddress = false,
}: ShippingFormProps) {
    const [formData, setFormData] = useState<Address>({
        type: 'shipping',
        first_name: initialAddress?.first_name || '',
        last_name: initialAddress?.last_name || '',
        address_line1: initialAddress?.address_line1 || '',
        address_line2: initialAddress?.address_line2 || '',
        city: initialAddress?.city || '',
        state: initialAddress?.state || '',
        postal_code: initialAddress?.postal_code || '',
        country: initialAddress?.country || 'US',
        phone: initialAddress?.phone || '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saveAddress, setSaveAddress] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.first_name.trim())
            newErrors.first_name = 'First name is required';
        if (!formData.last_name.trim())
            newErrors.last_name = 'Last name is required';
        if (!formData.address_line1.trim())
            newErrors.address_line1 = 'Address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.state.trim()) newErrors.state = 'State is required';
        if (!formData.postal_code.trim())
            newErrors.postal_code = 'Postal code is required';
        if (!formData.country.trim()) newErrors.country = 'Country is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(formData, saveAddress);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="first_name">
                        First Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        className={errors.first_name ? 'border-destructive' : ''}
                    />
                    {errors.first_name && (
                        <p className="text-sm text-destructive">
                            {errors.first_name}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="last_name">
                        Last Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        className={errors.last_name ? 'border-destructive' : ''}
                    />
                    {errors.last_name && (
                        <p className="text-sm text-destructive">
                            {errors.last_name}
                        </p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="address_line1">
                    Address Line 1 <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="address_line1"
                    name="address_line1"
                    value={formData.address_line1}
                    onChange={handleChange}
                    className={errors.address_line1 ? 'border-destructive' : ''}
                />
                {errors.address_line1 && (
                    <p className="text-sm text-destructive">
                        {errors.address_line1}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="address_line2">Address Line 2</Label>
                <Input
                    id="address_line2"
                    name="address_line2"
                    value={formData.address_line2}
                    onChange={handleChange}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="city">
                        City <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className={errors.city ? 'border-destructive' : ''}
                    />
                    {errors.city && (
                        <p className="text-sm text-destructive">
                            {errors.city}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="postal_code">
                        Postal Code <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="postal_code"
                        name="postal_code"
                        value={formData.postal_code}
                        onChange={handleChange}
                        className={errors.postal_code ? 'border-destructive' : ''}
                    />
                    {errors.postal_code && (
                        <p className="text-sm text-destructive">
                            {errors.postal_code}
                        </p>
                    )}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="country">
                        Country <span className="text-destructive">*</span>
                    </Label>
                    <Select
                        value={formData.country}
                        onValueChange={(value) =>
                            setFormData((prev) => ({
                                ...prev,
                                country: value,
                            }))
                        }
                    >
                        <SelectTrigger
                            className={errors.country ? 'border-destructive' : ''}
                        >
                            <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                            {COUNTRIES.map((country) => (
                                <SelectItem
                                    key={country.code}
                                    value={country.code}
                                >
                                    {country.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.country && (
                        <p className="text-sm text-destructive">
                            {errors.country}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="state">
                        State <span className="text-destructive">*</span>
                    </Label>
                    <Select
                        value={formData.state}
                        onValueChange={(value) =>
                            setFormData((prev) => ({ ...prev, state: value }))
                        }
                        disabled={!formData.country}
                    >
                        <SelectTrigger
                            className={errors.state ? 'border-destructive' : ''}
                        >
                            <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                            {US_STATES.map((state) => (
                                <SelectItem key={state.code} value={state.code}>
                                    {state.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.state && (
                        <p className="text-sm text-destructive">
                            {errors.state}
                        </p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="phone">
                    Phone Number <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className={errors.phone ? 'border-destructive' : ''}
                />
                {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone}</p>
                )}
            </div>

            {showSaveAddress && (
                <div className="flex items-center gap-2">
                    <Checkbox
                        id="save_address"
                        checked={saveAddress}
                        onCheckedChange={(checked) =>
                            setSaveAddress(checked as boolean)
                        }
                    />
                    <Label
                        htmlFor="save_address"
                        className="cursor-pointer font-normal"
                    >
                        Save this address for future orders
                    </Label>
                </div>
            )}

            <div className="flex gap-4">
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Continue
                </Button>
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                )}
            </div>
        </form>
    );
}
