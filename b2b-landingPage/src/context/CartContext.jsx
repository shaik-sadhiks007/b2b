import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../api/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [carts, setCarts] = useState([]);
    const [cartCount, setCartCount] = useState(0);

    const fetchCart = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setCarts([]);
                setCartCount(0);
                return;
            }
            const response = await axios.get(`${API_URL}/api/cart`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCarts(response.data);
            // Update cart count
            const totalItems = response.data.reduce((sum, cart) =>
                sum + cart.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
            );
            setCartCount(totalItems);
        } catch (err) {
            console.error('Failed to fetch cart:', err);
            setCarts([]);
            setCartCount(0);
        }
    }, []); // Empty dependency array since it doesn't depend on any props or state

    const addToCart = useCallback(async (restaurantId, restaurantName, items, photos = []) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return { success: false, error: 'Not logged in' };

            await axios.post(`${API_URL}/api/cart`, {
                restaurantId,
                restaurantName,
                items,
                photos
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Refresh cart after adding
            await fetchCart();
            return { success: true };
        } catch (err) {
            if (err.response?.status === 409) {
                return { 
                    success: false, 
                    error: 'Different restaurant',
                    currentRestaurant: {
                        id: err.response.data.restaurantId,
                        name: err.response.data.restaurantName
                    }
                };
            }
            return { success: false, error: err.message };
        }
    }, [fetchCart]);

    const updateCartItem = useCallback(async (itemId, quantity) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return { success: false, error: 'Not logged in' };

            const response = await axios.patch(`${API_URL}/api/cart/${itemId}`, {
                quantity
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data) {
                await fetchCart();
                return { success: true };
            }
            return { success: false, error: 'Failed to update cart' };
        } catch (err) {
            console.error('Failed to update cart item:', err);
            return { success: false, error: err.message };
        }
    }, [fetchCart]);

    const removeCartItem = useCallback(async (itemId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return { success: false, error: 'Not logged in' };

            await axios.delete(`${API_URL}/api/cart/${itemId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            await fetchCart();
            return { success: true };
        } catch (err) {
            console.error('Failed to remove cart item:', err);
            return { success: false, error: err.message };
        }
    }, [fetchCart]);

    const clearCart = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            await axios.delete(`${API_URL}/api/cart`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchCart();
        } catch (err) {
            console.error('Failed to clear cart:', err);
        }
    }, [fetchCart]);

    const isItemInCart = useCallback((itemId) => {
        return carts.some(cart => cart.items?.some(item => item.itemId === itemId));
    }, [carts]);

    // Initial cart fetch
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchCart();
        }
    }, [fetchCart]);

    return (
        <CartContext.Provider value={{
            carts,
            cartCount,
            fetchCart,
            addToCart,
            updateCartItem,
            removeCartItem,
            clearCart,
            isItemInCart
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}; 