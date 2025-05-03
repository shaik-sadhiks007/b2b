import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Header } from './Header';

const CartPage = () => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchCart();
    }, [navigate]);

    const fetchCart = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/cart', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCart(response.data[0]); // Get the first cart document
        } catch (err) {
            setError('Failed to fetch cart');
            toast.error('Failed to fetch cart');
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = async (itemId, change) => {
        try {
            const token = localStorage.getItem('token');
            // Find the current item in the cart
            const cartItem = cart.items.find(item => item.itemId === itemId || item.itemId === itemId.toString());
            if (!cartItem) {
                toast.error('Item not found in cart');
                return;
            }
            const newQuantity = cartItem.quantity + change;
            if (newQuantity < 1) {
                toast.error('Quantity cannot be less than 1');
                return;
            }
            const response = await axios.patch(`http://localhost:5000/api/cart/${itemId}`, {
                quantity: newQuantity
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data) {
                fetchCart(); 
            }
        } catch (err) {
            toast.error('Failed to update quantity');
        }
    };

    const handleRemoveItem = async (itemId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/cart/${itemId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCart(); // Refresh cart after removal
            toast.success('Item removed from cart');
        } catch (err) {
            toast.error('Failed to remove item');
        }
    };

    const handleClearCart = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete('http://localhost:5000/api/cart', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCart(null);
            toast.success('Cart cleared');
        } catch (err) {
            toast.error('Failed to clear cart');
        }
    };

    const calculateTotal = () => {
        if (!cart || !cart.items) return 0;
        return cart.items.reduce((total, item) => {
            return total + (item.totalPrice * item.quantity);
        }, 0);
    };

    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    if (error) return <div className="flex justify-center items-center h-screen">{error}</div>;
    if (!cart) return (
        <div className="flex justify-center items-center h-screen">
            <div className="text-center">
                <p className="text-gray-500 text-lg">Your cart is empty</p>
                <button
                    onClick={() => navigate('/')}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Continue Shopping
                </button>
            </div>
        </div>
    );

    return (
        <>
            <div className="container mx-auto px-4 py-8 mt-16">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl font-bold mb-8">Your Cart</h1>
                    {!cart.items || cart.items.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500 text-lg">Your cart is empty</p>
                            <button
                                onClick={() => navigate('/')}
                                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-lg">
                            <div className="p-6">
                                <div className="mb-4">
                                    <h2 className="text-xl font-semibold">{cart.restaurantName}</h2>
                                </div>
                                <div className="space-y-4">
                                    {cart.items.map((item) => (
                                        <div key={item.itemId} className="flex items-center gap-4 py-4 border-b">
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
                                                    onClick={() => handleQuantityChange(item.itemId, -1)}
                                                    className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
                                                >
                                                    −
                                                </button>
                                                <span className="w-8 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => handleQuantityChange(item.itemId, 1)}
                                                    className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <div className="text-right min-w-[80px]">
                                                ₹{(item.totalPrice * item.quantity).toFixed(2)}
                                            </div>
                                            <button
                                                onClick={() => handleRemoveItem(item.itemId)}
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
                                            onClick={handleClearCart}
                                            className="flex-1 px-6 py-3 border border-red-600 text-red-600 rounded-lg hover:bg-red-50"
                                        >
                                            Clear Cart
                                        </button>
                                        <button
                                            onClick={() => navigate('/checkout')}
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