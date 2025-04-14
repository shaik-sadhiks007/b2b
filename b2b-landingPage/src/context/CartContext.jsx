import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState({
        restaurantId: null,
        restaurantName: null,
        items: []
    });

    const addToCart = (item) => {
        // If cart is empty, add the item
        if (cart.items.length === 0) {
            setCart({
                restaurantId: item.restaurantId,
                restaurantName: item.restaurantName,
                items: [{ ...item, quantity: 1 }]
            });
            return { success: true };
        }

        // If item is from the same restaurant, add it
        if (cart.restaurantId === item.restaurantId) {
            const existingItemIndex = cart.items.findIndex(i => i._id === item._id);
            
            if (existingItemIndex !== -1) {
                const updatedItems = [...cart.items];
                updatedItems[existingItemIndex].quantity += 1;
                setCart(prev => ({ ...prev, items: updatedItems }));
            } else {
                setCart(prev => ({
                    ...prev,
                    items: [...prev.items, { ...item, quantity: 1 }]
                }));
            }
            return { success: true };
        }

        // If item is from a different restaurant, return false
        return { 
            success: false,
            currentRestaurant: {
                id: cart.restaurantId,
                name: cart.restaurantName
            }
        };
    };

    const removeFromCart = (itemId) => {
        setCart(prevCart => ({
            ...prevCart,
            items: prevCart.items.filter(item => item._id !== itemId)
        }));
    };

    const updateQuantity = (itemId, newQuantity) => {
        if (newQuantity < 1) return;

        setCart(prevCart => ({
            ...prevCart,
            items: prevCart.items.map(item =>
                item._id === itemId
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        }));
    };

    const clearCart = () => {
        setCart({
            restaurantId: null,
            restaurantName: null,
            items: []
        });
    };

    const getCartTotal = () => {
        return cart.items.reduce((total, item) => 
            total + (item.totalPrice * item.quantity), 0
        );
    };

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getCartTotal
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