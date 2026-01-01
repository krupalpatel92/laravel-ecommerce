export interface Address {
    id?: number;
    user_id?: number;
    type: 'shipping' | 'billing';
    first_name: string;
    last_name: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone: string;
    is_default?: boolean;
}

export interface Country {
    id: number;
    name: string;
    iso2: string;
    iso3: string;
    phone_code: string;
}

export interface State {
    id: number;
    name: string;
    state_code: string;
    country_id: number;
}

export interface CheckoutAddresses {
    shipping: Address | null;
    billing: Address | null;
    sameAsBilling: boolean;
}
