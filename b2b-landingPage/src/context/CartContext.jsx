import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../api/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [carts, setCarts] = useState([]);
    const [cartCount, setCartCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const clearCartState = useCallback(() => {
        setCarts([]);
        setCartCount(0);
        setError(null);
    }, []);

    const fetchCart = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                clearCartState();
                setLoading(false);
                return;
            }
            const response = await axios.get(`${API_URL}/api/cart`, {
                headers: { Authorization: `Bearer ${token}` }
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
    }, [clearCartState]);

    const addToCart = useCallback(async (restaurantId, restaurantName, items,serviceType) => {

        console.log('old cart', carts)
        const token = localStorage.getItem('token');

        if (!token) return { success: false, error: 'Not logged in' };

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
                console.log("1 if")
                // Update existing cart with new items list
                newCarts = [...carts];
                const oldItemCount = newCarts[existingCartIndex].items.reduce((sum, item) => sum + item.quantity, 0);
                newCarts[existingCartIndex] = { ...newCarts[existingCartIndex], items: items, photos: photos };
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
                        items: [...items]
                    }];
                } else {
                    newCarts = [...carts];
                    newCarts[0] = {
                        ...newCarts[0],
                        items: [...newCarts[0].items, ...items]
                    };
                }
                newCartCount = cartCount + items.reduce((sum, item) => sum + item.quantity, 0);
            }

            // Update state immediately (optimistically)
            setCarts(newCarts);
            setCartCount(newCartCount);

            console.log(newCarts, "newcart in context")
            // --- End Optimistic Update ---

            // Make the API call
            const response = await axios.post(`${API_URL}/api/cart`, {
                restaurantId,
                restaurantName,
                items,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 200 || response.status === 201) {
                success = true;
                // API success, state is already updated optimistically
            } else if (response.status === 409) {
                // Handle different restaurant error specifically
                console.error('API add to cart failed: Different restaurant', response.data);
                throw { status: 409, data: response.data }; // Throw object to catch below
            } else {
                console.error('API add to cart failed', response.status, response.data);
                throw new Error(response.data?.message || 'API add to cart failed');
            }

        } catch (err) {
            console.error('Failed to add to cart:', err);
            // --- Rollback Optimistic Update ---
            setCarts(originalCarts); // Revert state
            setCartCount(originalCartCount); // Revert count
            // --- End Rollback ---

            if (err.status === 409) {
                // Return the specific error object for different restaurant
                return {
                    success: false,
                    error: 'Different restaurant',
                    currentRestaurant: err.data
                };
            }

            setError('Failed to add to cart: ' + (err.message || 'Unknown error')); // Set error state
            return { success: false, error: err.message || 'Failed to add to cart' };
        }

        return { success: success };

    }, [carts, cartCount, setCarts, setCartCount, setError]); // Dependencies: state, state setters, error setter

    const updateCartItem = useCallback(async (itemId, quantity) => {
        const token = localStorage.getItem('token');
        if (!token) return { success: false, error: 'Not logged in' };

        const originalCarts = JSON.parse(JSON.stringify(carts));
        const originalCartCount = cartCount;
        let success = false;

        try {
            const cartIndex = carts.findIndex(cart => cart.items?.some(item => item.itemId === itemId));
            if (cartIndex === -1) {
                console.error('Item not found in cart for update', itemId);
                return { success: false, error: 'Item not found in cart' };
            }

            const itemIndex = carts[cartIndex].items.findIndex(item => item.itemId === itemId);
            if (itemIndex === -1) {
                console.error('Item not found in cart for update', itemId);
                return { success: false, error: 'Item not found in cart' };
            }

            const itemToUpdate = carts[cartIndex].items[itemIndex];
            const newQuantity = Math.max(1, quantity);

            const newItemTotalPrice = (itemToUpdate.basePrice + (itemToUpdate.packagingCharges || 0)) * newQuantity;

            const updatedItems = carts[cartIndex].items.map((item, index) =>
                index === itemIndex ? { ...item, quantity: newQuantity, totalPrice: newItemTotalPrice } : item
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
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 200) {
                success = true;
            } else {
                console.error('API update failed', response.status, response.data);
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
    }, [carts, cartCount, setCarts, setCartCount, setError]);

    const removeCartItem = useCallback(async (itemId) => {
        const token = localStorage.getItem('token');
        if (!token) return { success: false, error: 'Not logged in' };

        const originalCarts = JSON.parse(JSON.stringify(carts));
        const originalCartCount = cartCount;
        let success = false;

        try {
            const cartIndex = carts.findIndex(cart => cart.items?.some(item => item.itemId === itemId));
            if (cartIndex === -1) {
                console.error('Item not found in cart for removal', itemId);
                return { success: false, error: 'Item not found in cart' };
            }

            const itemToRemove = carts[cartIndex].items.find(item => item.itemId === itemId);
            if (!itemToRemove) {
                console.error('Item not found in cart for removal', itemId);
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
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 200) {
                success = true;
            } else {
                console.error('API deletion failed', response.status, response.data);
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
    }, [carts, cartCount, setCarts, setCartCount, setError]);

    const clearCart = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const originalCarts = JSON.parse(JSON.stringify(carts));
        const originalCartCount = cartCount;
        let success = false;

        setLoading(true);
        setError(null);
        setCarts([]);
        setCartCount(0);

        try {
            const response = await axios.delete(`${API_URL}/api/cart`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 200) {
                success = true;
            } else {
                console.error('API clear failed', response.status, response.data);
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
    }, [carts, cartCount, setCarts, setCartCount, setError, setLoading]);

    const isItemInCart = useCallback((itemId) => {
        return carts.some(cart => cart.items?.some(item => item.itemId === itemId));
    }, [carts]);

    useEffect(() => {
        console.log('CartContext useEffect running');
        const token = localStorage.getItem('token');
        if (token) {
            fetchCart();
        } else {
            setLoading(false);
            clearCartState();
        }
        return () => {
            console.log('CartContext useEffect cleaning up');
        };
    }, [fetchCart, clearCartState, setLoading]);

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