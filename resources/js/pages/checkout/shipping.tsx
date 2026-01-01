import AddressSelector from '@/components/checkout/address-selector';
import CheckoutSteps from '@/components/checkout/checkout-steps';
import ShippingForm from '@/components/checkout/shipping-form';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAddresses } from '@/hooks/use-addresses';
import { useCart } from '@/hooks/use-cart';
import AppLayout from '@/layouts/app-layout';
import { Address } from '@/types/address.types';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function CheckoutShipping() {
    const { auth } = usePage().props as any;
    const isAuthenticated = !!auth?.user;

    const { cart } = useCart();
    const itemCount = cart?.item_count || 0;
    const {
        addresses,
        isLoading: addressesLoading,
        fetchAddresses,
        saveAddress,
    } = useAddresses();

    const [shippingAddress, setShippingAddress] = useState<Address | null>(
        null,
    );
    const [billingAddress, setBillingAddress] = useState<Address | null>(null);
    const [sameAsShipping, setSameAsShipping] = useState(true);
    const [showNewShippingForm, setShowNewShippingForm] = useState(false);
    const [showNewBillingForm, setShowNewBillingForm] = useState(false);

    useEffect(() => {
        if (itemCount === 0) {
            router.visit('/cart');
        }
    }, [itemCount]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchAddresses();
        }
    }, [isAuthenticated, fetchAddresses]);

    const handleShippingSelect = (addressOrNew: Address | 'new') => {
        if (addressOrNew === 'new') {
            setShowNewShippingForm(true);
            setShippingAddress(null);
        } else {
            setShowNewShippingForm(false);
            setShippingAddress(addressOrNew);
        }
    };

    const handleShippingSubmit = async (
        address: Address,
        shouldSave?: boolean,
    ) => {
        if (isAuthenticated && shouldSave) {
            const saved = await saveAddress(address);
            if (saved) {
                setShippingAddress(saved);
                setShowNewShippingForm(false);
            }
        } else {
            setShippingAddress(address);
            setShowNewShippingForm(false);
        }
    };

    const handleBillingSelect = (addressOrNew: Address | 'new') => {
        if (addressOrNew === 'new') {
            setShowNewBillingForm(true);
            setBillingAddress(null);
        } else {
            setShowNewBillingForm(false);
            setBillingAddress(addressOrNew);
        }
    };

    const handleBillingSubmit = async (
        address: Address,
        shouldSave?: boolean,
    ) => {
        if (isAuthenticated && shouldSave) {
            const saved = await saveAddress({
                ...address,
                type: 'billing',
            });
            if (saved) {
                setBillingAddress(saved);
                setShowNewBillingForm(false);
            }
        } else {
            setBillingAddress({ ...address, type: 'billing' });
            setShowNewBillingForm(false);
        }
    };

    const handleContinueToPayment = () => {
        if (!shippingAddress) {
            toast.error('Please provide a shipping address');
            return;
        }

        if (!sameAsShipping && !billingAddress) {
            toast.error('Please provide a billing address');
            return;
        }

        // Store addresses in session storage for payment step
        const checkoutData = {
            shipping: shippingAddress,
            billing: sameAsShipping ? shippingAddress : billingAddress,
        };
        sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));

        // Navigate to payment step
        router.visit('/checkout/payment');
    };

    if (itemCount === 0) {
        return null;
    }

    return (
        <AppLayout>
            <Head title="Checkout - Shipping Information" />

            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

                <CheckoutSteps currentStep={2} />

                <div className="mt-8 space-y-8">
                    {/* Shipping Address Section */}
                    <Card className="p-6">
                        <h2 className="mb-4 text-xl font-semibold">
                            Shipping Address
                        </h2>

                        {isAuthenticated &&
                        !showNewShippingForm &&
                        addresses.length > 0 ? (
                            <AddressSelector
                                addresses={addresses.filter(
                                    (addr) => addr.type === 'shipping',
                                )}
                                selectedAddressId={shippingAddress?.id}
                                onSelect={handleShippingSelect}
                                type="shipping"
                            />
                        ) : (
                            <ShippingForm
                                initialAddress={shippingAddress || undefined}
                                onSubmit={handleShippingSubmit}
                                onCancel={
                                    isAuthenticated && addresses.length > 0
                                        ? () => setShowNewShippingForm(false)
                                        : undefined
                                }
                                showSaveAddress={isAuthenticated}
                            />
                        )}
                    </Card>

                    {/* Billing Address Section */}
                    <Card className="p-6">
                        <h2 className="mb-4 text-xl font-semibold">
                            Billing Address
                        </h2>

                        <div className="mb-4 flex items-center gap-2">
                            <Checkbox
                                id="same_as_shipping"
                                checked={sameAsShipping}
                                onCheckedChange={(checked) =>
                                    setSameAsShipping(checked as boolean)
                                }
                            />
                            <Label
                                htmlFor="same_as_shipping"
                                className="cursor-pointer font-normal"
                            >
                                Same as shipping address
                            </Label>
                        </div>

                        {!sameAsShipping && (
                            <>
                                {isAuthenticated &&
                                !showNewBillingForm &&
                                addresses.length > 0 ? (
                                    <AddressSelector
                                        addresses={addresses.filter(
                                            (addr) => addr.type === 'billing',
                                        )}
                                        selectedAddressId={billingAddress?.id}
                                        onSelect={handleBillingSelect}
                                        type="billing"
                                    />
                                ) : (
                                    <ShippingForm
                                        initialAddress={
                                            billingAddress || undefined
                                        }
                                        onSubmit={handleBillingSubmit}
                                        onCancel={
                                            isAuthenticated &&
                                            addresses.length > 0
                                                ? () =>
                                                      setShowNewBillingForm(
                                                          false,
                                                      )
                                                : undefined
                                        }
                                        showSaveAddress={isAuthenticated}
                                    />
                                )}
                            </>
                        )}
                    </Card>

                    {/* Navigation */}
                    <div className="flex justify-between">
                        <Button
                            variant="outline"
                            onClick={() => router.visit('/checkout')}
                        >
                            Back to Cart
                        </Button>

                        <Button
                            onClick={handleContinueToPayment}
                            disabled={
                                !shippingAddress ||
                                (!sameAsShipping && !billingAddress)
                            }
                        >
                            Continue to Payment
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
