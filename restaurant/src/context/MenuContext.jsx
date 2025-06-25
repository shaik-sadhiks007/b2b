import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../api/api';
import { AuthContext } from './AuthContext';
import { toast } from 'react-toastify';

export const MenuContext = createContext();

export const MenuProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user) {
            fetchMenu();
        }
    }, [user]);

    // Fetch all menu items
    const fetchMenu = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/api/menu`);
            setMenuItems(response.data);
            setLoading(false);
        } catch (error) {
            setError('Error fetching menu items');
            setLoading(false);
        }
    };

    // Add a new menu item
    const addMenuItem = async (itemData) => {
        try {
            const response = await axios.post(`${API_URL}/api/menu`, itemData);
            setMenuItems(prev => [...prev, response.data]);
            toast.success('Menu item added successfully');
        } catch (error) {
            setError('Error adding menu item');
            toast.error('Failed to add menu item');
        }
    };

    // Update a menu item
    const updateMenuItem = async (itemId, itemData) => {
        try {
            const response = await axios.put(`${API_URL}/api/menu/${itemId}`, itemData);
            setMenuItems(prev =>
                prev.map(item => (item._id === itemId ? response.data : item))
            );
            toast.success('Menu item updated successfully');
        } catch (error) {
            setError('Error updating menu item');
            toast.error('Failed to update menu item');
        }
    };

    // Delete a menu item
    const deleteMenuItem = async (itemId) => {
        try {
            await axios.delete(`${API_URL}/api/menu/${itemId}`);
            setMenuItems(prev => prev.filter(item => item._id !== itemId));
            toast.success('Menu item deleted successfully');
        } catch (error) {
            setError('Error deleting menu item');
            toast.error('Failed to delete menu item');
        }
    };

    // Helpers to get unique categories and subcategories
    const getCategories = () => {
        return [...new Set(menuItems.map(item => item.category).filter(Boolean))];
    };

    const getSubcategories = (category) => {
        return [
            ...new Set(
                menuItems
                    .filter(item => item.category === category)
                    .map(item => item.subcategory)
                    .filter(Boolean)
            ),
        ];
    };

    const value = {
        menuItems,
        loading,
        error,
        fetchMenu,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        getCategories,
        getSubcategories,
    };

    return (
        <MenuContext.Provider value={value}>
            {children}
        </MenuContext.Provider>
    );
}; 