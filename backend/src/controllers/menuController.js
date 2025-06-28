const Menu = require('../models/menuModel');
const { cloudinary, uploadMultipleBase64Images } = require('../config/cloudinary');

// Get all menu items for a business
const getAllMenuItems = async (req, res) => {
    try {
        const menuItems = await Menu.find({ businessId: req.restaurant._id });
        // Group by category and subcategory
        const grouped = {};
        menuItems.forEach(item => {
            const category = item.category || 'uncategorized';
            const subcategory = item.subcategory || 'general';
            if (!grouped[category]) grouped[category] = {};
            if (!grouped[category][subcategory]) grouped[category][subcategory] = [];
            grouped[category][subcategory].push(item);
        });
        // Convert to desired array structure, with 'Uncategorized' first
        const entries = Object.entries(grouped);
        const uncategorizedIndex = entries.findIndex(([category]) => category === 'uncategorized');
        let orderedEntries = entries;
        if (uncategorizedIndex !== -1) {
            // Move 'Uncategorized' to the front
            const [uncategorized] = entries.splice(uncategorizedIndex, 1);
            orderedEntries = [uncategorized, ...entries];
        }
        const result = orderedEntries.map(([category, subcats]) => ({
            category,
            subcategories: Object.entries(subcats).map(([subcategory, items]) => ({
                subcategory,
                items
            }))
        }));
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getAllMenuItemsOfPublic = async (req, res) => {
    try {
        const menuItems = await Menu.find({ businessId: req.params.id });
        // Group by category and subcategory
        const grouped = {};
        menuItems.forEach(item => {
            const category = item.category || 'uncategorized';
            const subcategory = item.subcategory || 'general';
            if (!grouped[category]) grouped[category] = {};
            if (!grouped[category][subcategory]) grouped[category][subcategory] = [];
            grouped[category][subcategory].push(item);
        });
        // Convert to desired array structure, with 'Uncategorized' first
        const entries = Object.entries(grouped);
        const uncategorizedIndex = entries.findIndex(([category]) => category === 'uncategorized');
        let orderedEntries = entries;
        if (uncategorizedIndex !== -1) {
            // Move 'Uncategorized' to the front
            const [uncategorized] = entries.splice(uncategorizedIndex, 1);
            orderedEntries = [uncategorized, ...entries];
        }
        const result = orderedEntries.map(([category, subcats]) => ({
            category,
            subcategories: Object.entries(subcats).map(([subcategory, items]) => ({
                subcategory,
                items
            }))
        }));
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllMenuItemsInstore = async (req, res) => {

    try {
        const businessId = req.restaurant._id;
        if (!businessId) {
            return res.status(400).json({ message: 'Business ID is required' });
        }
        const menuItems = await Menu.find({ businessId });
        res.json({ menu: menuItems });
    } catch (error) {
        console.error('Error fetching menu items:', error);
        res.status(500).json({ message: 'Error fetching menu items', error: error.message });
    }

}


// Get a single menu item
const getMenuItem = async (req, res) => {
    try {
        const item = await Menu.findOne({ _id: req.params.id, businessId: req.restaurant._id });
        if (!item) return res.status(404).json({ message: 'Menu item not found' });
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new menu item
const createMenuItem = async (req, res) => {
    try {
        // Use default values if category or subcategory are empty or missing
        console.log(req.body, 'body')
        const category = req.body.category && req.body.category.trim().toLowerCase() ? req.body.category : 'uncategorized';
        const subcategory = req.body.subcategory && req.body.subcategory.trim().toLowerCase() ? req.body.subcategory : 'general';
        
        // Handle photo upload if photo is provided
        let photoUrl = null;
        if (req.body.photos) {
            // Upload single photo to Cloudinary
            photoUrl = await uploadMultipleBase64Images([req.body.photos]);
            
            // Get the first (and only) uploaded photo URL
            photoUrl = photoUrl.length > 0 ? photoUrl[0] : null;
        }
        
        // Create menu item with uploaded photo URL
        const newItem = new Menu({
            ...req.body,
            photos: photoUrl,
            category,
            subcategory,
            businessId: req.restaurant._id
        });
        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (error) {
        console.error('Error creating menu item:', error);
        res.status(400).json({ message: error.message });
    }
};

// Create multiple menu items in bulk
const bulkCreateMenuItems = async (req, res) => {
    try {
        const { items } = req.body;
        
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Items array is required and must not be empty' });
        }

        const menuItemsToCreate = [];
        
        // Process each item and handle photo uploads
        for (const item of items) {
            const category = item.category && item.category.trim().toLowerCase() ? item.category : 'uncategorized';
            const subcategory = item.subcategory && item.subcategory.trim().toLowerCase() ? item.subcategory : 'general';
            
            let photoUrl = null;
            if (item.photos) {
                // Upload single photo to Cloudinary
                const photoUrls = await uploadMultipleBase64Images([item.photos]);
                
                // Get the first (and only) uploaded photo URL
                photoUrl = photoUrls.length > 0 ? photoUrls[0] : null;
            }
            
            menuItemsToCreate.push(new Menu({
                ...item,
                photos: photoUrl,
                category,
                subcategory,
                businessId: req.restaurant._id
            }));
        }

        const savedItems = await Menu.insertMany(menuItemsToCreate);
        res.status(201).json(savedItems);
    } catch (error) {
        console.error('Bulk create error:', error);
        res.status(400).json({ message: error.message });
    }
};

// Update a menu item
const updateMenuItem = async (req, res) => {
    try {
        // Handle photo upload if photo is provided in the update
        let updateData = { ...req.body };
        
        if (req.body.photos) {
            // Upload single photo to Cloudinary
            const photoUrls = await uploadMultipleBase64Images([req.body.photos]);
            
            // Get the first (and only) uploaded photo URL
            updateData.photos = photoUrls.length > 0 ? photoUrls[0] : null;
        }
        
        const updatedItem = await Menu.findOneAndUpdate(
            { _id: req.params.id, businessId: req.restaurant._id },
            updateData,
            { new: true }
        );
        if (!updatedItem) return res.status(404).json({ message: 'Menu item not found' });
        res.json(updatedItem);
    } catch (error) {
        console.error('Error updating menu item:', error);
        res.status(400).json({ message: error.message });
    }
};

// Delete a menu item
const deleteMenuItem = async (req, res) => {
    try {
        const deleted = await Menu.findOneAndDelete({ _id: req.params.id, businessId: req.restaurant._id });
        if (!deleted) return res.status(404).json({ message: 'Menu item not found' });
        res.json({ message: 'Menu item deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete multiple menu items in bulk
const bulkDeleteMenuItems = async (req, res) => {
    try {
        const { itemIds } = req.body;
        
        if (!Array.isArray(itemIds) || itemIds.length === 0) {
            return res.status(400).json({ message: 'Item IDs array is required and must not be empty' });
        }

        const result = await Menu.deleteMany({ 
            _id: { $in: itemIds }, 
            businessId: req.restaurant._id 
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'No menu items found to delete' });
        }

        res.json({ 
            message: `${result.deletedCount} menu items deleted successfully`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Bulk delete error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Rename a category
const renameCategory = async (req, res) => {
    try {
        const { oldCategory, newCategory } = req.body;
        if (!oldCategory || !newCategory) {
            return res.status(400).json({ message: 'Both oldCategory and newCategory are required' });
        }
        const result = await Menu.updateMany(
            { businessId: req.restaurant._id, category: oldCategory },
            { $set: { category: newCategory } }
        );
        res.json({ message: `Category renamed from '${oldCategory}' to '${newCategory}'`, modifiedCount: result.modifiedCount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Rename a subcategory
const renameSubcategory = async (req, res) => {
    try {
        const { category, oldSubcategory, newSubcategory } = req.body;
        if (!category || !oldSubcategory || !newSubcategory) {
            return res.status(400).json({ message: 'category, oldSubcategory, and newSubcategory are required' });
        }
        const result = await Menu.updateMany(
            { businessId: req.restaurant._id, category, subcategory: oldSubcategory },
            { $set: { subcategory: newSubcategory } }
        );
        res.json({ message: `Subcategory renamed from '${oldSubcategory}' to '${newSubcategory}' in category '${category}'`, modifiedCount: result.modifiedCount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllMenuItemsOfPublic,
    getAllMenuItems,
    getMenuItem,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getAllMenuItemsInstore,
    bulkCreateMenuItems,
    bulkDeleteMenuItems,
    renameCategory,
    renameSubcategory,
};
