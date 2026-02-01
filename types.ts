
export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
}

export interface CartItem extends Product {
    quantity: number;
}

export interface UserDetails {
    name: string;
    phone: string;
    address: string;
}
