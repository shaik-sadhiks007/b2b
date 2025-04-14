import React from 'react';
import { useCart } from '../context/CartContext';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();

    if (!cart.restaurantId) {
        return (
            <div className="fixed right-4 top-20 bg-white rounded-lg shadow-lg p-4 w-80">
                <h2 className="text-lg font-semibold mb-4">Your Cart</h2>
                <p className="text-gray-500">Your cart is empty</p>
            </div>
        );
    }

    return (
        <div className="fixed right-4 top-20 bg-white rounded-lg shadow-lg p-4 w-80">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Your Cart</h2>
                <span className="text-sm text-gray-500">{cart.restaurantName}</span>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
                {cart.items.map(item => (
                    <div key={item._id} className="flex items-center gap-4 border-b pb-4">
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
                                <h4 className="font-medium">{item.name}</h4>
                            </div>
                            <div className="text-sm text-gray-600">₹{item.totalPrice}</div>
                            <div className="flex items-center gap-2 mt-1">
                                <button
                                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                    className="w-6 h-6 flex items-center justify-center border rounded"
                                >
                                    -
                                </button>
                                <span>{item.quantity}</span>
                                <button
                                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                    className="w-6 h-6 flex items-center justify-center border rounded"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={() => removeFromCart(item._id)}
                            className="text-red-500 hover:text-red-700"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center mb-4">
                    <span className="font-medium">Total</span>
                    <span className="font-medium">₹{getCartTotal()}</span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={clearCart}
                        className="flex-1 py-2 px-4 border border-gray-300 rounded hover:bg-gray-100"
                    >
                        Clear Cart
                    </button>
                    <button
                        className="flex-1 py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Checkout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart; 