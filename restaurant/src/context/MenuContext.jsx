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
            const newItem = response.data;
            
            setMenuItems(prev => {
                // Find if category exists
                const categoryIndex = prev.findIndex(cat => cat.category === newItem.category);
                
                if (categoryIndex !== -1) {
                    // Category exists, find if subcategory exists
                    const category = prev[categoryIndex];
                    const subcategoryIndex = category.subcategories.findIndex(sub => sub.subcategory === newItem.subcategory);
                    
                    if (subcategoryIndex !== -1) {
                        // Subcategory exists, add item to existing subcategory
                        const updatedMenuItems = [...prev];
                        updatedMenuItems[categoryIndex] = {
                            ...category,
                            subcategories: [...category.subcategories]
                        };
                        updatedMenuItems[categoryIndex].subcategories[subcategoryIndex] = {
                            ...category.subcategories[subcategoryIndex],
                            items: [...category.subcategories[subcategoryIndex].items, newItem]
                        };
                        return updatedMenuItems;
                    } else {
                        // Subcategory doesn't exist, create new subcategory
                        const updatedMenuItems = [...prev];
                        updatedMenuItems[categoryIndex] = {
                            ...category,
                            subcategories: [...category.subcategories, {
                                subcategory: newItem.subcategory,
                                items: [newItem]
                            }]
                        };
                        return updatedMenuItems;
                    }
                } else {
                    // Category doesn't exist, create new category with subcategory
                    return [...prev, {
                        category: newItem.category,
                        subcategories: [{
                            subcategory: newItem.subcategory,
                            items: [newItem]
                        }]
                    }];
                }
            });
            
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
            const updatedItem = response.data;
            
            setMenuItems(prev => {
                // Find the item in the structured data
                for (let categoryIndex = 0; categoryIndex < prev.length; categoryIndex++) {
                    const category = prev[categoryIndex];
                    for (let subcategoryIndex = 0; subcategoryIndex < category.subcategories.length; subcategoryIndex++) {
                        const subcategory = category.subcategories[subcategoryIndex];
                        const itemIndex = subcategory.items.findIndex(item => item._id === itemId);
                        
                        if (itemIndex !== -1) {
                            // Found the item, update it
                            const updatedMenuItems = [...prev];
                            updatedMenuItems[categoryIndex] = {
                                ...category,
                                subcategories: [...category.subcategories]
                            };
                            updatedMenuItems[categoryIndex].subcategories[subcategoryIndex] = {
                                ...subcategory,
                                items: [...subcategory.items]
                            };
                            updatedMenuItems[categoryIndex].subcategories[subcategoryIndex].items[itemIndex] = updatedItem;
                            return updatedMenuItems;
                        }
                    }
                }
                return prev; // Item not found
            });
            
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
            
            setMenuItems(prev => {
                // Find the item in the structured data
                for (let categoryIndex = 0; categoryIndex < prev.length; categoryIndex++) {
                    const category = prev[categoryIndex];
                    for (let subcategoryIndex = 0; subcategoryIndex < category.subcategories.length; subcategoryIndex++) {
                        const subcategory = category.subcategories[subcategoryIndex];
                        const itemIndex = subcategory.items.findIndex(item => item._id === itemId);
                        
                        if (itemIndex !== -1) {
                            // Found the item, remove it
                            const updatedMenuItems = [...prev];
                            updatedMenuItems[categoryIndex] = {
                                ...category,
                                subcategories: [...category.subcategories]
                            };
                            updatedMenuItems[categoryIndex].subcategories[subcategoryIndex] = {
                                ...subcategory,
                                items: subcategory.items.filter((_, index) => index !== itemIndex)
                            };
                            
                            // If subcategory is now empty, remove it
                            if (updatedMenuItems[categoryIndex].subcategories[subcategoryIndex].items.length === 0) {
                                updatedMenuItems[categoryIndex].subcategories = updatedMenuItems[categoryIndex].subcategories.filter((_, index) => index !== subcategoryIndex);
                            }
                            
                            // If category is now empty, remove it
                            if (updatedMenuItems[categoryIndex].subcategories.length === 0) {
                                return updatedMenuItems.filter((_, index) => index !== categoryIndex);
                            }
                            
                            return updatedMenuItems;
                        }
                    }
                }
                return prev; // Item not found
            });
            
            toast.success('Menu item deleted successfully');
        } catch (error) {
            setError('Error deleting menu item');
            toast.error('Failed to delete menu item');
        }
    };

    // Add multiple menu items in bulk
    const bulkAddMenuItems = async (itemsData) => {
        try {
            // Use the new bulk endpoint instead of multiple individual calls
            const response = await axios.post(`${API_URL}/api/menu/bulk`, {
                items: itemsData
            });
            
            const newItems = response.data;
            
            setMenuItems(prev => {
                const updatedMenuItems = [...prev];
                
                newItems.forEach(newItem => {
                    // Find if category exists
                    const categoryIndex = updatedMenuItems.findIndex(cat => cat.category === newItem.category);
                    
                    if (categoryIndex !== -1) {
                        // Category exists, find if subcategory exists
                        const category = updatedMenuItems[categoryIndex];
                        const subcategoryIndex = category.subcategories.findIndex(sub => sub.subcategory === newItem.subcategory);
                        
                        if (subcategoryIndex !== -1) {
                            // Subcategory exists, add item to existing subcategory
                            updatedMenuItems[categoryIndex] = {
                                ...category,
                                subcategories: [...category.subcategories]
                            };
                            updatedMenuItems[categoryIndex].subcategories[subcategoryIndex] = {
                                ...category.subcategories[subcategoryIndex],
                                items: [...category.subcategories[subcategoryIndex].items, newItem]
                            };
                        } else {
                            // Subcategory doesn't exist, create new subcategory
                            updatedMenuItems[categoryIndex] = {
                                ...category,
                                subcategories: [...category.subcategories, {
                                    subcategory: newItem.subcategory,
                                    items: [newItem]
                                }]
                            };
                        }
                    } else {
                        // Category doesn't exist, create new category with subcategory
                        updatedMenuItems.push({
                            category: newItem.category,
                            subcategories: [{
                                subcategory: newItem.subcategory,
                                items: [newItem]
                            }]
                        });
                    }
                });
                
                return updatedMenuItems;
            });
            
            toast.success(`Successfully added ${newItems.length} menu items`);
        } catch (error) {
            setError('Error adding menu items in bulk');
            toast.error('Failed to add menu items in bulk');
            throw error;
        }
    };

    // Delete multiple menu items in bulk
    const bulkDeleteMenuItems = async (itemIds) => {
        try {
            const response = await axios.delete(`${API_URL}/api/menu/bulk`, {
                data: { itemIds }
            });
            
            const { deletedCount } = response.data;
            
            setMenuItems(prev => {
                const updatedMenuItems = [...prev];
                
                // Remove deleted items from the state
                updatedMenuItems.forEach(category => {
                    category.subcategories.forEach(subcategory => {
                        subcategory.items = subcategory.items.filter(item => !itemIds.includes(item._id));
                    });
                });
                
                // Remove empty subcategories and categories
                const cleanedMenuItems = updatedMenuItems.map(category => ({
                    ...category,
                    subcategories: category.subcategories.filter(sub => sub.items.length > 0)
                })).filter(category => category.subcategories.length > 0);
                
                return cleanedMenuItems;
            });
            
            toast.success(`Successfully deleted ${deletedCount} menu items`);
        } catch (error) {
            setError('Error deleting menu items in bulk');
            toast.error('Failed to delete menu items in bulk');
            throw error;
        }
    };

    // Helpers to get unique categories and subcategories
    const getCategories = () => {
        return menuItems.map(category => category.category);
    };

    const getSubcategories = (category) => {
        const categoryObj = menuItems.find(cat => cat.category === category);
        return categoryObj ? categoryObj.subcategories.map(sub => sub.subcategory) : [];
    };

    // Rename a category
    const renameCategory = async (oldCategory, newCategory) => {
        try {
            await axios.put(`${API_URL}/api/menu/category/rename`, { oldCategory, newCategory });
            await fetchMenu();
            toast.success('Category renamed successfully');
        } catch (error) {
            setError('Error renaming category');
            toast.error('Failed to rename category');
            throw error;
        }
    };

    // Rename a subcategory
    const renameSubcategory = async (category, oldSubcategory, newSubcategory) => {
        try {
            await axios.put(`${API_URL}/api/menu/subcategory/rename`, { category, oldSubcategory, newSubcategory });
            await fetchMenu();
            toast.success('Subcategory renamed successfully');
        } catch (error) {
            setError('Error renaming subcategory');
            toast.error('Failed to rename subcategory');
            throw error;
        }
    };

    // Delete all items in a category
    const deleteCategory = async (category) => {
        try {
            const categoryObj = menuItems.find(cat => cat.category === category);
            if (!categoryObj) return;
            const itemIds = categoryObj.subcategories.flatMap(sub => sub.items.map(item => item._id));
            if (itemIds.length === 0) return;
            await bulkDeleteMenuItems(itemIds);
            toast.success('Category deleted successfully');
        } catch (error) {
            setError('Error deleting category');
            toast.error('Failed to delete category');
            throw error;
        }
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
        bulkAddMenuItems,
        bulkDeleteMenuItems,
        renameCategory,
        renameSubcategory,
        deleteCategory,
    };

    return (
        <MenuContext.Provider value={value}>
            {children}
        </MenuContext.Provider>
    );
}; 