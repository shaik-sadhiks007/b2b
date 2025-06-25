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
        const newItem = new Menu({
            ...req.body,
            category,
            subcategory,
            businessId: req.restaurant._id
        });
        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a menu item
const updateMenuItem = async (req, res) => {
    try {
        const updatedItem = await Menu.findOneAndUpdate(
            { _id: req.params.id, businessId: req.restaurant._id },
            req.body,
            { new: true }
        );
        if (!updatedItem) return res.status(404).json({ message: 'Menu item not found' });
        res.json(updatedItem);
    } catch (error) {
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



module.exports = {
    getAllMenuItemsOfPublic,
    getAllMenuItems,
    getMenuItem,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getAllMenuItemsInstore

};
