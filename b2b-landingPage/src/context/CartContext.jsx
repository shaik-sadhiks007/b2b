import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../api/api';
import { HotelContext } from '../contextApi/HotelContextProvider';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [carts, setCarts] = useState([]);
    const [cartCount, setCartCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useContext(HotelContext);

    const clearCartState = useCallback(() => {
        setCarts([]);
        setCartCount(0);
        setError(null);
    }, []);

    // Effect to clear cart when user logs out
    useEffect(() => {
        if (!user) {
            clearCartState();
        }
    }, [user, clearCartState]);

    const fetchCart = useCallback(async () => {
        if (!user) {
            clearCartState();
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_URL}/api/cart`, {
                withCredentials: true
            });
            setCarts(response.data);
            const totalItems = response.data.reduce((sum, cart) =>
                sum + cart.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
            );
            setCartCount(totalItems);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch cart:', err);
            setError('Failed to fetch cart: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    }, [clearCartState, user]);

    const addToCart = useCallback(async (restaurantId, restaurantName, items, serviceType) => {
        if (!user) return { success: false, error: 'Not logged in' };

        // --- Optimistic Update ---
        const originalCarts = JSON.parse(JSON.stringify(carts)); // Deep copy for rollback
        const originalCartCount = cartCount;
        let success = false;
        setError(null); // Clear previous errors

        try {
            // Find the existing cart for this restaurant
            const existingCartIndex = carts.findIndex(cart => cart.restaurantId === restaurantId);

            let newCarts;
            let newCartCount;

            if (existingCartIndex !== -1) {
                // Update existing cart with new items list
                newCarts = [...carts];
                const oldItemCount = newCarts[existingCartIndex].items.reduce((sum, item) => sum + item.quantity, 0);
                newCarts[existingCartIndex] = { ...newCarts[existingCartIndex], items: items };
                newCartCount = cartCount - oldItemCount + items.reduce((sum, item) => sum + item.quantity, 0);
            } else {
                // Handle both empty cart and existing cart cases
                if (carts.length === 0) {
                    newCarts = [{
                        restaurantId: {
                            _id: restaurantId,
                            serviceType
                        },
                        restaurantName,
                        items: [...items],
                        serviceType
                    }];
                    newCartCount = items.reduce((sum, item) => sum + item.quantity, 0);
                } else if (carts[0].restaurantId._id !== restaurantId) {
                    // If restaurant IDs don't match, clear existing cart and add new items
                    newCarts = [{
                        restaurantId: {
                            _id: restaurantId,
                            serviceType
                        },
                        restaurantName,
                        items: [...items],
                        serviceType
                    }];
                    newCartCount = items.reduce((sum, item) => sum + item.quantity, 0);
                } else {
                    newCarts = [...carts];
                    newCarts[0] = {
                        ...newCarts[0],
                        items: [...newCarts[0].items, ...items],
                        serviceType
                    };
                    newCartCount = cartCount + items.reduce((sum, item) => sum + item.quantity, 0);
                }
            }

            // Update state immediately (optimistically)
            setCarts(newCarts);
            setCartCount(newCartCount);

            // Make the API call
            const response = await axios.post(`${API_URL}/api/cart`, {
                restaurantId,
                restaurantName,
                items,
            }, {
                withCredentials: true
            });

            if (response.status === 200 || response.status === 201) {
                success = true;
            } else if (response.status === 409) {
                throw { status: 409, data: response.data };
            } else {
                throw new Error(response.data?.message || 'API add to cart failed');
            }

        } catch (err) {
            console.error('Failed to add to cart:', err);
            // --- Rollback Optimistic Update ---
            setCarts(originalCarts);
            setCartCount(originalCartCount);

            if (err.status === 409) {
                return {
                    success: false,
                    error: 'Different restaurant',
                    currentRestaurant: err.data
                };
            }

            setError('Failed to add to cart: ' + (err.message || 'Unknown error'));
            return { success: false, error: err.message || 'Failed to add to cart' };
        }

        return { success: success };
    }, [carts, cartCount, user]);

    const updateCartItem = useCallback(async (itemId, quantity) => {
        if (!user) return { success: false, error: 'Not logged in' };

        const originalCarts = JSON.parse(JSON.stringify(carts));
        const originalCartCount = cartCount;
        let success = false;

        try {
            const cartIndex = carts.findIndex(cart => cart.items?.some(item => item.itemId === itemId));
            if (cartIndex === -1) {
                return { success: false, error: 'Item not found in cart' };
            }

            const itemIndex = carts[cartIndex].items.findIndex(item => item.itemId === itemId);
            if (itemIndex === -1) {
                return { success: false, error: 'Item not found in cart' };
            }

            const itemToUpdate = carts[cartIndex].items[itemIndex];
            const newQuantity = Math.max(1, quantity);

            // const newItemTotalPrice = (itemToUpdate.basePrice + (itemToUpdate.packagingCharges || 0)) * newQuantity;

            const updatedItems = carts[cartIndex].items.map((item, index) =>
                index === itemIndex ? { ...item, quantity: newQuantity } : item
            );
            const updatedCart = { ...carts[cartIndex], items: updatedItems };

            const newCarts = [...carts];
            newCarts[cartIndex] = updatedCart;

            setCarts(newCarts);
            setCartCount(prevCount => prevCount - itemToUpdate.quantity + newQuantity);
            setError(null);

            const response = await axios.patch(`${API_URL}/api/cart/${itemId}`, {
                quantity: newQuantity
            }, {
                withCredentials: true
            });

            if (response.status === 200) {
                success = true;
            } else {
                throw new Error(response.data?.message || 'API update failed');
            }
        } catch (err) {
            console.error('Failed to update cart item:', err);
            setCarts(originalCarts);
            setCartCount(originalCartCount);
            setError('Failed to update cart item: ' + (err.response?.data?.message || err.message));
            return { success: false, error: err.response?.data?.message || err.message };
        }

        return { success: success };
    }, [carts, cartCount, user]);

    const removeCartItem = useCallback(async (itemId) => {
        if (!user) return { success: false, error: 'Not logged in' };

        const originalCarts = JSON.parse(JSON.stringify(carts));
        const originalCartCount = cartCount;
        let success = false;

        try {
            const cartIndex = carts.findIndex(cart => cart.items?.some(item => item.itemId === itemId));
            if (cartIndex === -1) {
                return { success: false, error: 'Item not found in cart' };
            }

            const itemToRemove = carts[cartIndex].items.find(item => item.itemId === itemId);
            if (!itemToRemove) {
                return { success: false, error: 'Item not found in cart' };
            }

            const updatedItems = carts[cartIndex].items.filter(item => item.itemId !== itemId);

            let newCarts;
            let removedQuantity = itemToRemove.quantity;

            if (updatedItems.length === 0) {
                newCarts = carts.filter((_, index) => index !== cartIndex);
                removedQuantity = originalCartCount;
            } else {
                const updatedCart = { ...carts[cartIndex], items: updatedItems };
                newCarts = [...carts];
                newCarts[cartIndex] = updatedCart;
            }

            setCarts(newCarts);
            setCartCount(prevCount => prevCount - removedQuantity);
            setError(null);

            const response = await axios.delete(`${API_URL}/api/cart/${itemId}`, {
                withCredentials: true
            });

            if (response.status === 200) {
                success = true;
            } else {
                throw new Error(response.data?.message || 'API deletion failed');
            }
        } catch (err) {
            console.error('Failed to remove cart item:', err);
            setCarts(originalCarts);
            setCartCount(originalCartCount);
            setError('Failed to remove cart item: ' + (err.response?.data?.message || err.message));
            return { success: false, error: err.response?.data?.message || err.message };
        }

        return { success: success };
    }, [carts, cartCount, user]);

    const clearCart = useCallback(async () => {
        if (!user) return { success: false, error: 'Not logged in' };

        const originalCarts = JSON.parse(JSON.stringify(carts));
        const originalCartCount = cartCount;
        let success = false;

        setLoading(true);
        setError(null);
        setCarts([]);
        setCartCount(0);

        try {
            const response = await axios.delete(`${API_URL}/api/cart`, {
                withCredentials: true
            });

            if (response.status === 200) {
                success = true;
            } else {
                throw new Error(response.data?.message || 'API clear failed');
            }
        } catch (err) {
            console.error('Failed to clear cart:', err);
            setError('Failed to clear cart: ' + (err.response?.data?.message || err.message));
            return { success: false, error: err.response?.data?.message || err.message };
        } finally {
            setLoading(false);
        }

        return { success: success };
    }, [carts, cartCount, user]);

    const isItemInCart = useCallback((itemId) => {
        return carts.some(cart => cart.items?.some(item => item.itemId === itemId));
    }, [carts]);

    useEffect(() => {
        if (user) {
            fetchCart();
        } else {
            setLoading(false);
            clearCartState();
        }
    }, [fetchCart, clearCartState, user]);

    return (
        <CartContext.Provider value={{
            carts,
            cartCount,
            loading,
            error,
            fetchCart,
            addToCart,
            updateCartItem,
            removeCartItem,
            clearCart,
            isItemInCart,
            clearCartState
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