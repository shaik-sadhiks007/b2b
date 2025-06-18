import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../api/api';
import { AuthContext } from './AuthContext';
import { toast } from 'react-toastify';

export const MenuContext = createContext();

export const MenuProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);

    // Fetch menu items when user is authenticated
    useEffect(() => {
        if (user) {
            fetchMenu();
        }
    }, [user]);

    // Fetch menu items
    const fetchMenu = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/menu`);
            setCategories(response.data);
            setLoading(false);
        } catch (error) {
            setError('Error fetching menu items');
            setLoading(false);
        }
    };

    // Add new category
    const addCategory = async (name) => {
        try {
            const newCategory = {
                name: name,
                isExpanded: true,
                subcategories: []
            };
            await axios.post(`${API_URL}/api/menu`, newCategory);
            fetchMenu();
            toast.success('Category added successfully');
        } catch (error) {
            setError('Error adding category');
            toast.error('Failed to add category');
        }
    };

    // Update category
    const updateCategory = async (categoryId, newName) => {
        if (!categoryId) {
            setError('Category ID is required');
            return;
        }
        try {
            await axios.put(`${API_URL}/api/menu/${categoryId}`, { name: newName });
            fetchMenu();
            toast.success('Category updated successfully');
        } catch (error) {
            setError('Error updating category');
            toast.error('Failed to update category');
        }
    };

    // Delete category
    const deleteCategory = async (categoryId) => {
        try {
            await axios.delete(`${API_URL}/api/menu/${categoryId}`);
            fetchMenu();
            toast.success('Category deleted successfully');
        } catch (error) {
            setError('Error deleting category');
            toast.error('Failed to delete category');
        }
    };

    // Add new subcategory
    const addSubcategory = async (categoryId, name) => {
        if (!categoryId) {
            setError('Category ID is required');
            return;
        }
        try {
            const newSubcategory = {
                name: name,
                items: []
            };
            await axios.post(`${API_URL}/api/menu/${categoryId}/subcategories`, newSubcategory);
            fetchMenu();
            toast.success('Subcategory added successfully');
        } catch (error) {
            setError('Error adding subcategory');
            toast.error('Failed to add subcategory');
        }
    };

    // Update subcategory
    const updateSubcategory = async (categoryId, subcategoryId, newName) => {
        if (!categoryId || !subcategoryId) {
            setError('Category ID and Subcategory ID are required');
            return;
        }
        try {
            await axios.put(`${API_URL}/api/menu/${categoryId}/subcategories/${subcategoryId}`, { name: newName });
            fetchMenu();
            toast.success('Subcategory updated successfully');
        } catch (error) {
            setError('Error updating subcategory');
            toast.error('Failed to update subcategory');
        }
    };

    // Delete subcategory
    const deleteSubcategory = async (categoryId, subcategoryId) => {
        if (!categoryId || !subcategoryId) {
            setError('Category ID and Subcategory ID are required');
            return;
        }
        try {
            await axios.delete(`${API_URL}/api/menu/${categoryId}/subcategories/${subcategoryId}`);
            fetchMenu();
            toast.success('Subcategory deleted successfully');
        } catch (error) {
            setError('Error deleting subcategory');
            toast.error('Failed to delete subcategory');
        }
    };

    // Add new item to subcategory
    const addItem = async (categoryId, subcategoryId, itemData) => {
        try {
            const response = await axios.post(
                `${API_URL}/api/menu/${categoryId}/subcategories/${subcategoryId}/items`,
                itemData
            );

            // Update local state after successful addition
            setCategories(prevCategories => 
                prevCategories.map(category => {
                    if (category._id === categoryId) {
                        return {
                            ...category,
                            subcategories: category.subcategories.map(subcategory => {
                                if (subcategory._id === subcategoryId) {
                                    return {
                                        ...subcategory,
                                        items: [...subcategory.items, response.data]
                                    };
                                }
                                return subcategory;
                            })
                        };
                    }
                    return category;
                })
            );

            // Update selectedSubcategory if it's the one we're adding to
            if (selectedSubcategory?._id === subcategoryId) {
                setSelectedSubcategory(prev => ({
                    ...prev,
                    items: [...prev.items, response.data]
                }));
            }

           toast.success('Item added successfully');
        } catch (error) {
            setError('Error adding item');
            toast.error('Failed to add item');
        }
    };
     const addItemsBulk = async (categoryId, subcategoryId, itemNames) => {
       if (!Array.isArray(itemNames) || itemNames.length === 0) {
        setError('No item names provided');
        toast.error('No item names provided');
        return;
    }
    try {
        // Prepare item objects
        const items = itemNames.map(name => ({
            name,
            basePrice: "30",
            totalPrice: "30",
            isVeg: true
        }));
  const response = await axios.post(
            `${API_URL}/api/menu/${categoryId}/subcategories/${subcategoryId}/items/bulk`,
            { items }
        );

        // Update local state after successful addition
        setCategories(prevCategories =>
            prevCategories.map(category => {
                if (category._id === categoryId) {
                    return {
                        ...category,
                        subcategories: category.subcategories.map(subcategory => {
                            if (subcategory._id === subcategoryId) {
                                return {
                                    ...subcategory,
                                    items: [...subcategory.items, ...response.data.items]
                                };
                            }
                            return subcategory;
                        })
                    };
                }
                return category;
            })
        );
     toast.success('Items added successfully');
    } catch (error) {
        setError('Error adding items in bulk');
        toast.error('Failed to add items in bulk');
    }
    };

      // Bulk delete items
    const deleteItemsBulk = async (categoryId, subcategoryId, itemIds) => {
       if (!Array.isArray(itemIds) || itemIds.length === 0) {
        setError('No item IDs provided');
        toast.error('No item IDs provided');
        return;
    }
     try {
        await axios.delete(
            `${API_URL}/api/menu/${categoryId}/subcategories/${subcategoryId}/items`,
            { data: { itemIds } }
        );
             // Update local state after successful deletion
        setCategories(prevCategories =>
            prevCategories.map(category => {
                if (category._id === categoryId) {
                    return {
                        ...category,
                        subcategories: category.subcategories.map(subcategory => {
                            if (subcategory._id === subcategoryId) {
                                return {
                                    ...subcategory,
                                    items: subcategory.items.filter(item => !itemIds.includes(item._id))
                                };
                            }
                            return subcategory;
                        })
                    };
                }
                return category;
            })
        );
        toast.success('Items deleted successfully');
    } catch (error) {
        setError('Error deleting items in bulk');
        toast.error('Failed to delete items in bulk');
    }

    };


    // Update item
    const updateItem = async (categoryId, subcategoryId, itemId, itemData) => {
        try {
            const response = await axios.put(
                `${API_URL}/api/menu/${categoryId}/subcategories/${subcategoryId}/items/${itemId}`,
                itemData
            );

            // Update the categories state with the edited item
            const updatedCategories = categories.map(category => {
                if (category._id === categoryId) {
                    return {
                        ...category,
                        subcategories: category.subcategories.map(subcategory => {
                            if (subcategory._id === subcategoryId) {
                                return {
                                    ...subcategory,
                                    items: subcategory.items.map(item =>
                                        item._id === itemId ? response.data : item
                                    )
                                };
                            }
                            return subcategory;
                        })
                    };
                }
                return category;
            });

            setCategories(updatedCategories);

            // Update selectedSubcategory if needed
            if (selectedSubcategory?._id === subcategoryId) {
                const updatedSubcategory = updatedCategories
                    .find(cat => cat._id === categoryId)
                    ?.subcategories.find(sub => sub._id === subcategoryId);

                if (updatedSubcategory) {
                    setSelectedSubcategory({ ...updatedSubcategory });
                }
            }

            toast.success('Item updated successfully');
        } catch (error) {
            setError('Error updating item');
            toast.error('Failed to update item');
        }
    };

    // Delete item
    const deleteItem = async (categoryId, subcategoryId, itemId) => {
        if (!categoryId || !subcategoryId || !itemId) {
            setError('Category ID, Subcategory ID, and Item ID are required');
            return;
        }
        try {
            await axios.delete(`${API_URL}/api/menu/${categoryId}/subcategories/${subcategoryId}/items/${itemId}`);
            
            // Update local state after successful deletion
            setCategories(prevCategories => 
                prevCategories.map(category => {
                    if (category._id === categoryId) {
                        return {
                            ...category,
                            subcategories: category.subcategories.map(subcategory => {
                                if (subcategory._id === subcategoryId) {
                                    return {
                                        ...subcategory,
                                        items: subcategory.items.filter(item => item._id !== itemId)
                                    };
                                }
                                return subcategory;
                            })
                        };
                    }
                    return category;
                })
            );

            // Update selectedSubcategory if it contains the deleted item
            if (selectedSubcategory?._id === subcategoryId) {
                setSelectedSubcategory(prev => ({
                    ...prev,
                    items: prev.items.filter(item => item._id !== itemId)
                }));
            }

            toast.success('Item deleted successfully');
        } catch (error) {
            setError('Error deleting item');
            toast.error('Failed to delete item');
        }
    };

    // Toggle category expansion
    const toggleCategoryExpansion = (categoryId) => {
        setCategories(categories.map(category => {
            if (category._id === categoryId) {
                return { ...category, isExpanded: !category.isExpanded };
            }
            return category;
        }));
    };

    const value = {
        categories,
        loading,
        error,
        selectedCategory,
        setSelectedCategory,
        selectedSubcategory,
        setSelectedSubcategory,
        addCategory,
        updateCategory,
        deleteCategory,
        addSubcategory,
        updateSubcategory,
        deleteSubcategory,
        addItem,
        updateItem,
        deleteItem,
        toggleCategoryExpansion,
        fetchMenu,
        addItemsBulk,
        deleteItemsBulk,
    };

    return (
        <MenuContext.Provider value={value}>
            {children}
        </MenuContext.Provider>
    );
}; 