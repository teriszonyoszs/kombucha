
import React, { useState, useMemo, useEffect } from 'react';
import { Product, CartItem, UserDetails } from './types';
import { PRODUCTS } from './constants';
import ProductCard from './components/ProductCard';
import OrderForm from './components/OrderForm';
import OrderSummary from './components/OrderSummary';

type PickupLocation = 'The Office Business Center' | 'Sigma Shopping Center';

const App: React.FC = () => {
    const [cart, setCart] = useState<Map<number, CartItem>>(new Map());
    const [userDetails, setUserDetails] = useState<UserDetails>({
        name: '',
        phone: '',
        address: '',
    });
    const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('pickup');
    const [pickupLocation, setPickupLocation] = useState<PickupLocation>('The Office Business Center');

    const handleQuantityChange = (product: Product, change: number) => {
        setCart(prevCart => {
            // FIX: Explicitly type `newCart` to prevent type inference issues where `existingItem` becomes `unknown`.
            const newCart = new Map<number, CartItem>(prevCart);
            const existingItem = newCart.get(product.id);
            const currentQuantity = existingItem ? existingItem.quantity : 0;
            const newQuantity = currentQuantity + change;

            if (newQuantity > 0) {
                newCart.set(product.id, { ...product, quantity: newQuantity });
            } else {
                newCart.delete(product.id);
            }
            return newCart;
        });
    };

    const handleUserDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setUserDetails(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleDeliveryMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDeliveryMethod(e.target.value as 'delivery' | 'pickup');
    };
    
    const handlePickupLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPickupLocation(e.target.value as PickupLocation);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (totalQuantity === 0) {
            alert("Your cart is empty. Please add some products to pre-order.");
            return;
        }
        
        const recipientEmail = "orders@yourkombucha.com"; // <-- CHANGE THIS TO YOUR EMAIL
        const emailSubject = `New Pre-Order from ${userDetails.name}`;

        const orderSummaryText = Array.from(cart.values())
            .map((item: CartItem) => `- ${item.name} x${item.quantity} (${(item.price * item.quantity).toFixed(2)} lei)`)
            .join('\n');

        let deliveryInfo = 'Pickup Order';
        if (deliveryMethod === 'delivery' && isDeliveryAvailable) {
            deliveryInfo = `Delivery Address: ${userDetails.address}`;
        } else if (deliveryMethod === 'pickup') {
            deliveryInfo = `Pickup Location: ${pickupLocation}`;
        }

        const emailBody = `
New Kombucha Pre-Order!

CUSTOMER DETAILS:
Name: ${userDetails.name}
Phone: ${userDetails.phone}
${deliveryInfo}

-------------------------

ORDER SUMMARY:
${orderSummaryText}

-------------------------

TOTAL: ${totalPrice.toFixed(2)} lei
        `.trim();

        const mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        
        window.location.href = mailtoLink;

        // Give the browser a moment to open the mail client before resetting the state
        setTimeout(() => {
            alert("Your order is ready to be sent!\n\nPlease click 'Send' in your email client to finalize your pre-order.");
            setCart(new Map());
            setUserDetails({ name: '', phone: '', address: '' });
            setDeliveryMethod('pickup');
            setPickupLocation('The Office Business Center');
        }, 500);
    };

    const { totalQuantity, totalPrice } = useMemo(() => {
        let quantity = 0;
        let price = 0;
        for (const item of cart.values()) {
            quantity += item.quantity;
            price += item.price * item.quantity;
        }
        return { totalQuantity: quantity, totalPrice: price };
    }, [cart]);

    const isDeliveryAvailable = totalQuantity > 2;
    const cartItems = Array.from(cart.values());

    useEffect(() => {
        if (!isDeliveryAvailable) {
            setDeliveryMethod('pickup');
        }
    }, [isDeliveryAvailable]);

    return (
        <div className="min-h-screen bg-amber-50 text-stone-800">
            <header className="bg-white shadow-md">
                <div className="container mx-auto px-4 py-6 text-center">
                    <h1 className="text-4xl font-bold text-emerald-800">Homemade Kombucha</h1>
                    <p className="text-lg mt-2 text-stone-600">Pre-order your favorite brew!</p>
                </div>
            </header>
            
            <main className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <h2 className="text-3xl font-semibold mb-6 text-emerald-700">Our Flavors</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {PRODUCTS.map(product => (
                                <ProductCard 
                                    key={product.id}
                                    product={product}
                                    quantity={cart.get(product.id)?.quantity || 0}
                                    onQuantityChange={(change) => handleQuantityChange(product, change)}
                                />
                            ))}
                        </div>
                    </div>
                    
                    <div className="lg:col-span-1">
                         <OrderForm
                            userDetails={userDetails}
                            isDeliveryAvailable={isDeliveryAvailable}
                            totalQuantity={totalQuantity}
                            onUserDetailsChange={handleUserDetailsChange}
                            onSubmit={handleSubmit}
                            deliveryMethod={deliveryMethod}
                            onDeliveryMethodChange={handleDeliveryMethodChange}
                            pickupLocation={pickupLocation}
                            onPickupLocationChange={handlePickupLocationChange}
                        />
                    </div>
                </div>
            </main>

            <OrderSummary items={cartItems} totalPrice={totalPrice} />
        </div>
    );
};

export default App;
