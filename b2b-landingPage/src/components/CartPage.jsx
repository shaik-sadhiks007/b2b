import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import { HotelContext } from '../contextApi/HotelContextProvider';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const CartItemSkeleton = () => (
    <div className="flex items-center gap-4 py-4 border-b">
        <div className="w-16 h-16">
            <Skeleton height={64} />
        </div>
        <div className="flex-1">
            <Skeleton width={200} height={20} className="mb-2" />
            <Skeleton width={150} height={16} />
        </div>
        <div className="flex items-center gap-3">
            <Skeleton width={32} height={32} />
            <Skeleton width={32} height={32} />
            <Skeleton width={32} height={32} />
        </div>
        <div className="text-right min-w-[80px]">
            <Skeleton width={60} height={20} />
        </div>
        <Skeleton width={20} height={20} />
    </div>
);

const CartSkeleton = () => (
    <div className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-4xl mx-auto">
            <Skeleton height={32} width={200} className="mb-8" />
            <div className="bg-white rounded-lg shadow-lg">
                <div className="p-6">
                    <Skeleton height={24} width={300} className="mb-4" />
                    <div className="space-y-4">
                        <CartItemSkeleton />
                        <CartItemSkeleton />
                        <CartItemSkeleton />
                    </div>
                    <div className="mt-6 pt-6 border-t">
                        <div className="flex justify-between items-center mb-4">
                            <Skeleton width={150} height={24} />
                            <Skeleton width={100} height={24} />
                        </div>
                        <div className="flex gap-4">
                            <Skeleton height={48} className="flex-1" />
                            <Skeleton height={48} className="flex-1" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const CartPage = () => {
    const navigate = useNavigate();
    const { user } = useContext(HotelContext);
    const { carts, loading, error, clearCart, updateCartItem, removeCartItem } = useCart();
    const cart = carts[0]; // Get the first cart document

    useEffect(() => {
        // Scroll to top when component mounts
        window.scrollTo(0, 0);
    }, []);
    
    useEffect(() => {
        if (!user && !loading && (!carts || carts.length === 0 || !carts[0]?.items || carts[0]?.items.length === 0)) {
            toast.error('Please login to view your cart');
            navigate('/login');
        }
    }, [navigate, carts, loading, user]);

    const handleQuantityChange = async (itemId, change) => {
        try {
            const currentCartData = carts[0];
            const cartItem = currentCartData?.items?.find(item => item.itemId === itemId || item.itemId === itemId.toString());
            if (!cartItem) {
                toast.error('Item not found in cart');
                return;
            }
            const newQuantity = cartItem.quantity + change;
            if (newQuantity < 1) {
                toast.error('Quantity cannot be less than 1');
                return;
            }

            const result = await updateCartItem(itemId, newQuantity);

            if (result.success) {
                // toast.success('Cart updated successfully');
            } else {
                toast.error(result.error || 'Failed to update quantity');
            }
        } catch (err) {
            console.error('Error updating quantity:', err);
            toast.error('Failed to update quantity');
        }
    };

    const handleRemoveItem = async (itemId) => {
        try {
            const result = await removeCartItem(itemId);

            if (result.success) {
                toast.success('Item removed from cart');
            } else {
                toast.error(result.error || 'Failed to remove item');
            }
        } catch (err) {
            console.error('Error removing item:', err);
            toast.error('Failed to remove item');
        }
    };

    const handleClearCart = async () => {
        try {
            await clearCart();
            toast.success('Cart cleared successfully');
        } catch (err) {
            console.error('Error clearing cart:', err);
            toast.error(err.message || 'Failed to clear cart');
        }
    };

    const calculateTotal = () => {
        if (!cart || !cart.items) return 0;
        return cart.items.reduce((total, item) => {
            return total + (item.totalPrice * item.quantity);
        }, 0);
    };

    console.log(carts, "carts");

    if (loading) return <CartSkeleton />;
    if (error) return <div className="flex justify-center items-center h-screen text-red-600">{error}</div>;
    if (!cart || !cart.items || cart.items.length === 0) return (
        <div className="flex justify-center items-center h-screen">
            <div className="text-center">
                <p className="text-gray-500 text-lg">Your cart is empty</p>
                <button
                    onClick={() => navigate('/')}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer transition-colors"
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
                                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer transition-colors"
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
                                    {cart.items.map((item, index) => (
                                        <div key={`${item.itemId}-${index}`} className="py-4 border-b">
                                            {/* Mobile layout */}
                                            <div className="flex items-center gap-3 sm:hidden">
                                                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                                    {item.photos?.length > 0 ? (
                                                        <img
                                                            src={item.photos[0]}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                                            <span className="text-xs text-gray-500">{item.name}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-sm truncate">{item.name}</div>
                                                    <div className="text-gray-600 text-xs mt-1">₹{item.basePrice}</div>
                                                </div>
                                                <div className="flex items-center border rounded-full px-2 py-1 bg-white shadow-sm ml-2">
                                                    <button
                                                        onClick={() => handleQuantityChange(item.itemId, -1)}
                                                        className="w-6 h-6 flex items-center justify-center text-lg text-gray-600 hover:text-red-500"
                                                    >−</button>
                                                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                                                    <button
                                                        onClick={() => handleQuantityChange(item.itemId, 1)}
                                                        className="w-6 h-6 flex items-center justify-center text-lg text-gray-600 hover:text-green-600"
                                                    >+</button>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveItem(item.itemId)}
                                                    className="ml-2 text-gray-400 hover:text-red-600"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </div>
                                            {/* Desktop/tablet layout (unchanged) */}
                                            <div className="hidden sm:flex items-center gap-4">
                                                <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden relative">
                                                    {item.photos?.length > 0 ? (
                                                        <img
                                                            src={item.photos[0]}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-300">
                                                            <span className="text-white text-sm font-bold text-center px-2">{item.name}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-3 h-3 border ${item.isVeg ? 'border-green-600' : 'border-red-600'} flex items-center justify-center`}>
                                                            <span className={`w-1.5 h-1.5 ${item.isVeg ? 'bg-green-600' : 'bg-red-600'} rounded-full`}></span>
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
                                                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors"
                                                    >
                                                        −
                                                    </button>
                                                    <span className="w-8 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => handleQuantityChange(item.itemId, 1)}
                                                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <div className="text-right min-w-[80px]">
                                                    ₹{(item.totalPrice * item.quantity).toFixed(2)}
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveItem(item.itemId)}
                                                    className="text-red-600 hover:text-red-700 cursor-pointer transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </div>
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
                                            className="flex-1 px-6 py-3 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
                                        >
                                            Clear Cart
                                        </button>
                                        <button
                                            onClick={() => navigate('/checkout')}
                                            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer transition-colors"
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