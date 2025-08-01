import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../api/api';
import { AuthContext } from './AuthContext';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';

export const MenuContext = createContext();

export const MenuProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const { ownerId } = useParams();
    const [menuItems, setMenuItems] = useState([]);
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [offersLoading, setOffersLoading] = useState(false);
    const [error, setError] = useState(null);
    const [offersError, setOffersError] = useState(null);

    const isAdminMode = user && user.role === 'admin' && ownerId;
    const businessId = isAdminMode ? ownerId : user?.businessId;

    useEffect(() => {
        if (user) {
            fetchMenu();
            fetchBusinessOffers();
        }
    }, [user, ownerId]);

    // Fetch all menu items
    const fetchMenu = async () => {
        setLoading(true);
        try {
            const endpoint = isAdminMode 
                ? `${API_URL}/api/menu/admin/all` 
                : `${API_URL}/api/menu`;
            
            const response = await axios.get(endpoint, isAdminMode ? { params: { ownerId } } : {});
            
            if (isAdminMode) {
                const grouped = groupMenuItems(response.data);
                setMenuItems(grouped);
            } else {
                setMenuItems(response.data);
            }
            setLoading(false);
        } catch (error) {
            setError(error.response?.data?.message || 'Error fetching menu items');
            setLoading(false);
        }
    };

    // Helper to group menu items by category and subcategory
    const groupMenuItems = (items) => {
        const grouped = {};
        items.forEach(item => {
            const category = item.category || 'uncategorized';
            const subcategory = item.subcategory || 'general';
            if (!grouped[category]) grouped[category] = {};
            if (!grouped[category][subcategory]) grouped[category][subcategory] = []; 
            grouped[category][subcategory].push(item);
        });

        const entries = Object.entries(grouped);
        const uncategorizedIndex = entries.findIndex(([category]) => category === 'uncategorized');
        let orderedEntries = entries;
        
        if (uncategorizedIndex !== -1) {
            const [uncategorized] = entries.splice(uncategorizedIndex, 1);
            orderedEntries = [uncategorized, ...entries];
        }

        return orderedEntries.map(([category, subcats]) => ({
            category,
            subcategories: Object.entries(subcats).map(([subcategory, items]) => ({
                subcategory,
                items
            }))
        }));
    };

    // Fetch offers for the current business
const fetchBusinessOffers = useCallback(async () => {
    // Add validation before making the request
    if (!user?.token || (!businessId && !isAdminMode)) {
        console.error('Missing required data for fetching offers');
        return;
    }

    console.log('Fetching offers with:', { 
        businessId: isAdminMode ? ownerId : user?.businessId,
        isAdminMode,
        ownerId,
        hasToken: !!user?.token
    });
    
    setOffersLoading(true);
    try {
        const endpoint = isAdminMode 
            ? `${API_URL}/api/offers/admin/business/${ownerId}`
            : `${API_URL}/api/offers/business`;
        
        const config = {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        };

        const response = await axios.get(endpoint, config);
        const offersData = response.data.data || response.data;
        
        if (!Array.isArray(offersData)) {
            throw new Error('Invalid offers data format');
        }
        
        setOffers(offersData);
        return offersData;
    } catch (error) {
        console.error('Offer fetch failed:', error);
        const errorMsg = error.response?.data?.message || error.message;
        setOffersError(errorMsg);
        throw error;
    } finally {
        setOffersLoading(false);
    }
}, [isAdminMode, ownerId, businessId, user?.token]);

    // Fetch offers for a specific menu item
    const fetchItemOffers = async (menuItemId) => {
        setOffersLoading(true);
        try {
            const response = await axios.get(`${API_URL}/api/offers/item/${menuItemId}`);
            setOffers(prev => {
                const existingOffers = prev.filter(o => o.menuItemId._id !== menuItemId);
                return [...existingOffers, ...response.data.data || response.data];
            });
            setOffersLoading(false);
        } catch (error) {
            setOffersError(error.response?.data?.message || 'Error fetching item offers');
            setOffersLoading(false);
        }
    };

    // Create a new offer
    const createOffer = async (formData) => {
        try {
            const parseDate = (dateInput) => {
                if (!dateInput) return null;
                if (dateInput instanceof Date) return dateInput;
                if (typeof dateInput === 'string' && dateInput.includes('T')) {
                    return new Date(dateInput);
                }
                if (typeof dateInput === 'string' && dateInput.includes('-')) {
                    const [day, month, year] = dateInput.split('-');
                    return new Date(`${year}-${month}-${day}`);
                }
                return new Date();
            };

            const payload = {
                menuItemId: formData.menuItemId,
                offerType: formData.offerType || 'bulk-price',
                title: formData.title,
                description: formData.description || '',
                purchaseQuantity: Number(formData.purchaseQuantity) || 2,
                discountedPrice: Number(formData.discountedPrice),
                isActive: formData.isActive !== false,
                startDate: parseDate(formData.startDate)?.toISOString() || new Date().toISOString(),
                endDate: formData.endDate ? parseDate(formData.endDate).toISOString() : null
            };

            if (!payload.menuItemId) throw new Error('Menu item is required');
            if (!payload.title) throw new Error('Title is required');
            
            if (payload.offerType === 'bulk-price') {
                if (payload.purchaseQuantity < 2) throw new Error('Purchase quantity must be at least 2');
                if (!payload.discountedPrice) throw new Error('Discounted price is required');
            }

            if (payload.endDate && new Date(payload.endDate) <= new Date(payload.startDate)) {
                throw new Error('End date must be after start date');
            }

            const endpoint = isAdminMode 
                ? `${API_URL}/api/offers/admin` 
                : `${API_URL}/api/offers`;
            
            const response = await axios.post(endpoint, payload, 
                isAdminMode ? { params: { ownerId } } : {}
            );

            setOffers(prev => [...prev, response.data]);
            toast.success('Offer created successfully!');
            return response.data;

        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message;
            toast.error(`Offer creation failed: ${errorMsg}`);
            throw error;
        }
    };

    // Update an existing offer
    const updateOffer = async (offerId, offerData) => {
        try {
            const endpoint = isAdminMode 
                ? `${API_URL}/api/offers/admin/${offerId}` 
                : `${API_URL}/api/offers/${offerId}`;
            
            const response = await axios.put(endpoint, offerData, isAdminMode ? { params: { ownerId } } : {});
            setOffers(prev => prev.map(o => 
                o._id === offerId ? response.data.data || response.data : o
            ));
            toast.success('Offer updated successfully');
            return response.data;
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to update offer';
            toast.error(errorMsg);
            throw new Error(errorMsg);
        }
    };

    // Toggle offer active status
    const toggleOfferStatus = async (offerId) => {
        try {
            const endpoint = isAdminMode 
                ? `${API_URL}/api/offers/admin/${offerId}/toggle-status` 
                : `${API_URL}/api/offers/${offerId}/toggle-status`;
            
            const response = await axios.patch(endpoint, {}, isAdminMode ? { params: { ownerId } } : {});
            setOffers(prev => prev.map(o => 
                o._id === offerId ? response.data.data || response.data : o
            ));
            toast.success('Offer status updated');
            return response.data;
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to toggle offer status';
            toast.error(errorMsg);
            throw new Error(errorMsg);
        }
    };

    // Delete an offer
   const deleteOffer = async (offerId) => {
  try {
    console.log('Attempting to delete offer ID:', offerId); // Debug log
    
    if (!offerId) {
      throw new Error('No offer ID provided for deletion');
    }

    const endpoint = isAdminMode 
      ? `${API_URL}/api/offers/admin/${offerId}`
      : `${API_URL}/api/offers/${offerId}`;
    
    console.log('Delete endpoint:', endpoint); // Debug log
    
    await axios.delete(endpoint, isAdminMode ? { params: { ownerId } } : {});
    
    setOffers(prev => prev.filter(o => o._id !== offerId));
    toast.success('Offer deleted successfully');
  } catch (error) {
    console.error('Delete error:', error); // Detailed error logging
    const errorMsg = error.response?.data?.message || error.message;
    toast.error(`Delete failed: ${errorMsg}`);
  }
};

    // Get offers for a specific menu item
    const getOffersForItem = (menuItemId) => {
        return offers.filter(o => o.menuItemId?._id === menuItemId);
    };

    // Calculate effective price based on offers
    const calculateEffectivePrice = (menuItem) => {
        if (!menuItem) return 0;
        
        const itemOffers = getOffersForItem(menuItem._id);
        if (itemOffers.length === 0) return menuItem.totalPrice;

        const offer = itemOffers[0];
        const unitValue = menuItem.unitValue || 1;
        
         switch(offer.offerType) {
        case 'bulk-price':
            return offer.discountedPrice / offer.purchaseQuantity;
        case 'buy-x-get-y-free':
            return (menuItem.totalPrice * offer.buyQuantity) / (offer.buyQuantity + offer.freeQuantity);
        case 'percentage-discount':
            return menuItem.totalPrice * (1 - (offer.discountPercentage / 100));
        case 'fixed-discount':
            return Math.max(0, menuItem.totalPrice - offer.discountAmount);
        default:
            return menuItem.totalPrice;
    }
    };

    // Add a new menu item
    const addMenuItem = async (itemData) => {
        try {
             
            const endpoint = isAdminMode 
                ? `${API_URL}/api/menu/admin` 
                : `${API_URL}/api/menu`;
            
            const response = await axios.post(endpoint, itemData, isAdminMode ? { params: { ownerId } } : {});
            const newItem = response.data;
            
            setMenuItems(prev => {
                if (isAdminMode) {
                    return groupMenuItems([...prev.flatMap(cat => 
                        cat.subcategories.flatMap(sub => sub.items)), newItem]);
                }
                
                const categoryIndex = prev.findIndex(c => c.category === newItem.category);
                if (categoryIndex === -1) {
                    return [...prev, {
                        category: newItem.category,
                        subcategories: [{
                            subcategory: newItem.subcategory,
                            items: [newItem]
                        }]
                    }];
                }
                
                const subcategoryIndex = prev[categoryIndex].subcategories
                    .findIndex(s => s.subcategory === newItem.subcategory);
                
                if (subcategoryIndex === -1) {
                    return prev.map((cat, idx) => 
                        idx === categoryIndex 
                            ? {
                                ...cat,
                                subcategories: [...cat.subcategories, {
                                    subcategory: newItem.subcategory,
                                    items: [newItem]
                                }]
                            }
                            : cat
                    );
                }
                
                return prev.map((cat, idx) => 
                    idx === categoryIndex 
                        ? {
                            ...cat,
                            subcategories: cat.subcategories.map((sub, sIdx) => 
                                sIdx === subcategoryIndex 
                                    ? {
                                        ...sub,
                                        items: [...sub.items, newItem]
                                    }
                                    : sub
                            )
                        }
                        : cat
                );
            });
            
            toast.success('Menu item added successfully');
            return newItem;
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to add menu item';
            toast.error(errorMsg);
            throw new Error(errorMsg);
        }
    };

    // Update a menu item
    const updateMenuItem = async (itemId, itemData) => {
        try {
            const payload = {
            ...itemData,
            unit: itemData.unit || 'piece', // default to 'piece' if not provided
            unitValue: itemData.unitValue || 1 // default to 1 if not provided
        };

            const endpoint = isAdminMode 
                ? `${API_URL}/api/menu/admin/${itemId}` 
                : `${API_URL}/api/menu/${itemId}`;
            
            const response = await axios.put(endpoint, payload,  isAdminMode ? { params: { ownerId } } : {});
            const updatedItem = response.data;
            
            setMenuItems(prev => {
                if (isAdminMode) {
                    return groupMenuItems(
                        prev.flatMap(cat => 
                            cat.subcategories.flatMap(sub => 
                                sub.items.map(item => 
                                    item._id === itemId ? updatedItem : item
                                )
                            )
                        )
                    );
                }
                
                return prev.map(category => ({
                    ...category,
                    subcategories: category.subcategories.map(subcategory => ({
                        ...subcategory,
                        items: subcategory.items.map(item => 
                            item._id === itemId ? updatedItem : item
                        )
                    }))
                }));
            });
            
            toast.success('Menu item updated successfully');
            return updatedItem;
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to update menu item';
            toast.error(errorMsg);
            throw new Error(errorMsg);
        }
    };

    // Delete a menu item
    const deleteMenuItem = async (itemId) => {
        try {
            const endpoint = isAdminMode 
                ? `${API_URL}/api/menu/admin/${itemId}` 
                : `${API_URL}/api/menu/${itemId}`;
            
            await axios.delete(endpoint, isAdminMode ? { params: { ownerId } } : {});
            
            setMenuItems(prev => {
                if (isAdminMode) {
                    const remainingItems = prev.flatMap(cat => 
                        cat.subcategories.flatMap(sub => 
                            sub.items.filter(item => item._id !== itemId)
                        ));
                    return groupMenuItems(remainingItems);
                }
                
                const newMenuItems = prev
                    .map(category => ({
                        ...category,
                        subcategories: category.subcategories
                            .map(subcategory => ({
                                ...subcategory,
                                items: subcategory.items.filter(item => item._id !== itemId)
                            }))
                            .filter(subcategory => subcategory.items.length > 0)
                    }))
                    .filter(category => category.subcategories.length > 0);
                
                return newMenuItems;
            });
            
            toast.success('Menu item deleted successfully');
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to delete menu item';
            toast.error(errorMsg);
            throw new Error(errorMsg);
        }
    };

    // Bulk operations for menu items
    const bulkAddMenuItems = async (items) => {
        try {
             

            const endpoint = isAdminMode 
                ? `${API_URL}/api/menu/admin/bulk` 
                : `${API_URL}/api/menu/bulk`;
            
            const response = await axios.post(endpoint, { items }, isAdminMode ? { params: { ownerId } } : {});
            const newItems = response.data;
            
            setMenuItems(prev => {
                if (isAdminMode) {
                    return groupMenuItems([
                        ...prev.flatMap(cat => cat.subcategories.flatMap(sub => sub.items)),
                        ...newItems
                    ]);
                }
                
                const newMenuItems = [...prev];
                
                newItems.forEach(newItem => {
                    const categoryIndex = newMenuItems.findIndex(c => c.category === newItem.category);
                    
                    if (categoryIndex === -1) {
                        newMenuItems.push({
                            category: newItem.category,
                            subcategories: [{
                                subcategory: newItem.subcategory,
                                items: [newItem]
                            }]
                        });
                        return;
                    }
                    
                    const subcategoryIndex = newMenuItems[categoryIndex].subcategories
                        .findIndex(s => s.subcategory === newItem.subcategory);
                    
                    if (subcategoryIndex === -1) {
                        newMenuItems[categoryIndex].subcategories.push({
                            subcategory: newItem.subcategory,
                            items: [newItem]
                        });
                        return;
                    }
                    
                    newMenuItems[categoryIndex].subcategories[subcategoryIndex].items.push(newItem);
                });
                
                return newMenuItems;
            });
            
            toast.success(`${newItems.length} menu items added successfully`);
            return newItems;
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to add menu items in bulk';
            toast.error(errorMsg);
            throw new Error(errorMsg);
        }
    };

    const bulkDeleteMenuItems = async (itemIds) => {
        try {
            const endpoint = isAdminMode 
                ? `${API_URL}/api/menu/admin/bulk` 
                : `${API_URL}/api/menu/bulk`;
            
            const response = await axios.delete(endpoint, {
                params: isAdminMode ? { ownerId } : undefined,
                data: { itemIds }
            });
            
            setMenuItems(prev => {
                if (isAdminMode) {
                    const remainingItems = prev.flatMap(cat => 
                        cat.subcategories.flatMap(sub => 
                            sub.items.filter(item => !itemIds.includes(item._id))
                        ));
                    return groupMenuItems(remainingItems);
                }
                
                return prev
                    .map(category => ({
                        ...category,
                        subcategories: category.subcategories
                            .map(subcategory => ({
                                ...subcategory,
                                items: subcategory.items.filter(item => !itemIds.includes(item._id))
                            }))  
                            .filter(subcategory => subcategory.items.length > 0)
                    })) 
                    .filter(category => category.subcategories.length > 0);
            });
            
            toast.success(`${response.data.deletedCount} menu items deleted successfully`);
            return response.data.deletedCount;
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to delete menu items in bulk';
            toast.error(errorMsg);
            throw new Error(errorMsg);
        }
    };

    // Category operations
    const renameCategory = async (oldCategory, newCategory) => {
        try {
            await axios.put(`${API_URL}/api/menu/category/rename`, { oldCategory, newCategory });
            await fetchMenu();
            toast.success('Category renamed successfully');
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to rename category';
            toast.error(errorMsg);
            throw new Error(errorMsg);
        }
    };

    const renameSubcategory = async (category, oldSubcategory, newSubcategory) => {
        try {
            await axios.put(`${API_URL}/api/menu/subcategory/rename`, { 
                category, 
                oldSubcategory, 
                newSubcategory 
            });
            await fetchMenu();
            toast.success('Subcategory renamed successfully');
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to rename subcategory';
            toast.error(errorMsg);
            throw new Error(errorMsg);
        }
    };

    const deleteCategory = async (category) => {
        try {
            const categoryItems = menuItems.find(c => c.category === category);
            if (!categoryItems) return;
            
            const itemIds = categoryItems.subcategories.flatMap(s => s.items.map(i => i._id));
            if (itemIds.length === 0) return;
            
            await bulkDeleteMenuItems(itemIds);
            toast.success('Category deleted successfully');
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to delete category';
            toast.error(errorMsg);
            throw new Error(errorMsg);
        }
    };

    const value = {
        menuItems,
        loading,
        error,
        offers,
        offersLoading,
        offersError,
        fetchMenu,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        bulkAddMenuItems,
        bulkDeleteMenuItems,
        renameCategory,
        renameSubcategory,
        deleteCategory,
        fetchBusinessOffers,
        fetchItemOffers,
        createOffer,
        updateOffer,
        toggleOfferStatus,
        deleteOffer,
        getOffersForItem,
        calculateEffectivePrice
    };

    return (
        <MenuContext.Provider value={value}>
            {children}
        </MenuContext.Provider>
    );
};