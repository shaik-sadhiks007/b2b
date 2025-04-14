import React from 'react';
import { useCart } from '../context/CartContext';
import { Header } from './Header';

const CartPage = () => {
    const { cart, addToCart, removeFromCart, clearCart, updateQuantity } = useCart();

    console.log(cart,"cart")

    const handleQuantityChange = (item, change) => {
        const newQuantity = item.quantity + change;
        if (newQuantity > 0) {
            updateQuantity(item._id, newQuantity);
        }
    };

    const handleRemoveItem = (itemId) => {
        removeFromCart(itemId);
    };

    const calculateTotal = () => {
        return cart.items?.reduce((total, item) => {
            return total + (parseFloat(item.totalPrice) * item.quantity);
        }, 0) || 0;
    };

    return (
        <>
            <Header />
            <div className="container mx-auto px-4 py-8 mt-16">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl font-bold mb-8">Your Cart</h1>
                    {!cart.items || cart.items.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500 text-lg">Your cart is empty</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-lg">
                            <div className="p-6">
                                <div className="mb-4">
                                    <h2 className="text-xl font-semibold">{cart.restaurantName}</h2>
                                </div>
                                <div className="space-y-4">
                                    {cart.items.map((item) => (
                                        <div key={item._id} className="flex items-center gap-4 py-4 border-b">
                                            <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                                                <img
                                                    src={item.photos?.[0] || 'https://via.placeholder.com/150?text=Food'}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-3 h-3 border ${
                                                        item.isVeg ? 'border-green-600' : 'border-red-600'
                                                    } flex items-center justify-center`}>
                                                        <span className={`w-1.5 h-1.5 ${
                                                            item.isVeg ? 'bg-green-600' : 'bg-red-600'
                                                        } rounded-full`}></span>
                                                    </span>
                                                    <h3 className="font-medium">{item.name}</h3>
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    ₹{item.basePrice} + ₹{item.packagingCharges} packaging
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => handleQuantityChange(item, -1)}
                                                    className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
                                                >
                                                    −
                                                </button>
                                                <span className="w-8 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => handleQuantityChange(item, 1)}
                                                    className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <div className="text-right min-w-[80px]">
                                                ₹{(parseFloat(item.totalPrice) * item.quantity).toFixed(2)}
                                            </div>
                                            <button
                                                onClick={() => handleRemoveItem(item._id)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 pt-6 border-t">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-lg font-semibold">Total Amount</span>
                                        <span className="text-lg font-semibold">₹{calculateTotal().toFixed(2)}</span>
                                    </div>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={clearCart}
                                            className="flex-1 px-6 py-3 border border-red-600 text-red-600 rounded-lg hover:bg-red-50"
                                        >
                                            Clear Cart
                                        </button>
                                        <button
                                            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                        >
                                            Proceed to Checkout
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default CartPage; 