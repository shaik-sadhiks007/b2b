const Menu = require('../models/menuModel');
const { uploadBase64ImageToS3, getS3ObjectUrl, deleteS3Object } = require('../utils/awsS3');

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
        console.error('[menuController.js][getAllMenuItems]', error);
        console.trace('[menuController.js][getAllMenuItems] Stack trace:');
        res.status(500).json({ message: 'Error fetching menu items', error: error.message });
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
        console.error('[menuController.js][getAllMenuItemsOfPublic]', error);
        console.trace('[menuController.js][getAllMenuItemsOfPublic] Stack trace:');
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
        console.error('[menuController.js][getAllMenuItemsInstore]', error);
        console.trace('[menuController.js][getAllMenuItemsInstore] Stack trace:');
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
        console.error('[menuController.js][getMenuItem]', error);
        console.trace('[menuController.js][getMenuItem] Stack trace:');
        res.status(500).json({ message: error.message });
    }
};

// Create a new menu item
const createMenuItem = async (req, res) => {
    try {
        // Use default values if category or subcategory are empty or missing
        const category = req.body.category && req.body.category.trim().toLowerCase() ? req.body.category : 'uncategorized';
        const subcategory = req.body.subcategory && req.body.subcategory.trim().toLowerCase() ? req.body.subcategory : 'general';

        // Handle photo upload if photo is provided
        let photoUrl = null;
        if (req.body.photos) {
            // Upload single photo to S3
            const s3Key = await uploadBase64ImageToS3(req.body.photos);
            photoUrl = getS3ObjectUrl(s3Key);
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
        const io = req.app.get('io');
        io.emit('menuUpdated', {
            businessId: req.restaurant._id,
            menuItem: savedItem
        });
        res.status(201).json(savedItem);
    } catch (error) {
        console.error('[menuController.js][createMenuItem]', error);
        console.trace('[menuController.js][createMenuItem] Stack trace:');
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
                // Upload single photo to S3
                const s3Key = await uploadBase64ImageToS3(item.photos);
                photoUrl = getS3ObjectUrl(s3Key);
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
        console.error('[menuController.js][bulkCreateMenuItems]', error);
        console.trace('[menuController.js][bulkCreateMenuItems] Stack trace:');
        res.status(400).json({ message: error.message });
    }
};

// Update a menu item
const updateMenuItem = async (req, res) => {
    try {
        // Handle photo upload if photo is provided in the update
        let updateData = { ...req.body };
        let oldPhotoKey = null;
        let oldPhotoUrl = null;
        if (req.body.photos) {
            // Find the existing item to get the old photo URL
            const existingItem = await Menu.findOne({ _id: req.params.id, businessId: req.restaurant._id });
            if (existingItem && existingItem.photos) {
                oldPhotoUrl = existingItem.photos;
                // Extract the S3 key from the old photo URL
                const s3UrlPrefix = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;
                if (oldPhotoUrl.startsWith(s3UrlPrefix)) {
                    oldPhotoKey = oldPhotoUrl.replace(s3UrlPrefix, '');
                }
            }
            // Upload single photo to S3
            const s3Key = await uploadBase64ImageToS3(req.body.photos);
            updateData.photos = getS3ObjectUrl(s3Key);
        }
        
        const updatedItem = await Menu.findOneAndUpdate(
            { _id: req.params.id, businessId: req.restaurant._id },
            updateData,
            { new: true }
        );
        // Delete the old photo from S3 after updating
        if (oldPhotoKey) {
            await deleteS3Object(oldPhotoKey);
        }
       
        if (!updatedItem) return res.status(404).json({ message: 'Menu item not found' });

         if (updatedItem) {
    const io = req.app.get('io');
    io.emit('menuUpdated', { businessId: req.restaurant._id, menuItem: updatedItem });
}
        res.json(updatedItem);
    } catch (error) {
        console.error('[menuController.js][updateMenuItem]', error);
        console.trace('[menuController.js][updateMenuItem] Stack trace:');
        res.status(400).json({ message: error.message });
    }
};

// Delete a menu item
const deleteMenuItem = async (req, res) => {
    try {
        const deleted = await Menu.findOneAndDelete({ _id: req.params.id, businessId: req.restaurant._id });
        if (!deleted) return res.status(404).json({ message: 'Menu item not found' });
        // Fire-and-forget delete of S3 image if present
        if (deleted.photos) {
            const s3UrlPrefix = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;
            if (deleted.photos.startsWith(s3UrlPrefix)) {
                const oldPhotoKey = deleted.photos.replace(s3UrlPrefix, '');
                deleteS3Object(oldPhotoKey); // don't await
            }
        }
        const io = req.app.get('io');
io.emit('menuUpdated', { businessId: req.restaurant._id, deletedItemId: req.params.id });
        res.json({ message: 'Menu item deleted' });
    } catch (error) {
        console.error('[menuController.js][deleteMenuItem]', error);
        console.trace('[menuController.js][deleteMenuItem] Stack trace:');
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

        // Find all items to be deleted to get their photo URLs
        const itemsToDelete = await Menu.find({ 
            _id: { $in: itemIds }, 
            businessId: req.restaurant._id 
        });

        const result = await Menu.deleteMany({ 
            _id: { $in: itemIds }, 
            businessId: req.restaurant._id 
        });

        // Fire-and-forget delete of S3 images for each item
        const s3UrlPrefix = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;
        itemsToDelete.forEach(item => {
            if (item.photos && item.photos.startsWith(s3UrlPrefix)) {
                const oldPhotoKey = item.photos.replace(s3UrlPrefix, '');
                deleteS3Object(oldPhotoKey); // don't await
            }
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'No menu items found to delete' });
        }

        res.json({ 
            message: `${result.deletedCount} menu items deleted successfully`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('[menuController.js][bulkDeleteMenuItems]', error);
        console.trace('[menuController.js][bulkDeleteMenuItems] Stack trace:');
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
        console.error('[menuController.js][renameCategory]', error);
        console.trace('[menuController.js][renameCategory] Stack trace:');
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
        console.error('[menuController.js][renameSubcategory]', error);
        console.trace('[menuController.js][renameSubcategory] Stack trace:');
        res.status(500).json({ message: error.message });
    }
};

// Admin: Get all menu items for a business by ownerId
const getAllMenuItemsByAdmin = async (req, res) => {
    try {
        const { ownerId } = req.query;
        if (!ownerId) return res.status(400).json({ message: 'ownerId is required' });
        const Business = require('../models/businessModel');
        const business = await Business.findOne({ owner: ownerId });
        if (!business) return res.status(404).json({ message: 'Business not found for this owner' });
        const menuItems = await Menu.find({ businessId: business._id });
        res.json(menuItems);
    } catch (error) {
        console.error('[menuController.js][getAllMenuItemsByAdmin]', error);
        res.status(500).json({ message: 'Error fetching menu items', error: error.message });
    }
};

// Admin: Create menu item for a business by ownerId
const createMenuItemByAdmin = async (req, res) => {
    try {
        const { ownerId } = req.query;
        if (!ownerId) return res.status(400).json({ message: 'ownerId is required' });
        const Business = require('../models/businessModel');
        const business = await Business.findOne({ owner: ownerId });
        if (!business) return res.status(404).json({ message: 'Business not found for this owner' });
        const category = req.body.category && req.body.category.trim().toLowerCase() ? req.body.category : 'uncategorized';
        const subcategory = req.body.subcategory && req.body.subcategory.trim().toLowerCase() ? req.body.subcategory : 'general';
        let photoUrl = null;
        if (req.body.photos) {
            const s3Key = await uploadBase64ImageToS3(req.body.photos);
            photoUrl = getS3ObjectUrl(s3Key);
        }
        const newItem = new Menu({
            ...req.body,
            photos: photoUrl,
            category,
            subcategory,
            businessId: business._id
        });
        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (error) {
        console.error('[menuController.js][createMenuItemByAdmin]', error);
        res.status(400).json({ message: error.message });
    }
};

// Admin: Update menu item for a business by ownerId
const updateMenuItemByAdmin = async (req, res) => {
    try {
        const { ownerId } = req.query;
        if (!ownerId) return res.status(400).json({ message: 'ownerId is required' });
        const Business = require('../models/businessModel');
        const business = await Business.findOne({ owner: ownerId });
        if (!business) return res.status(404).json({ message: 'Business not found for this owner' });
        let updateData = { ...req.body };
        let oldPhotoKey = null;
        let oldPhotoUrl = null;
        if (req.body.photos) {
            const existingItem = await Menu.findOne({ _id: req.params.id, businessId: business._id });
            if (existingItem && existingItem.photos) {
                oldPhotoUrl = existingItem.photos;
                const s3UrlPrefix = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;
                if (oldPhotoUrl.startsWith(s3UrlPrefix)) {
                    oldPhotoKey = oldPhotoUrl.replace(s3UrlPrefix, '');
                }
            }
            const s3Key = await uploadBase64ImageToS3(req.body.photos);
            updateData.photos = getS3ObjectUrl(s3Key);
        }
        const updatedItem = await Menu.findOneAndUpdate(
            { _id: req.params.id, businessId: business._id },
            updateData,
            { new: true }
        );
        if (oldPhotoKey) {
            await deleteS3Object(oldPhotoKey);
        }
        if (!updatedItem) return res.status(404).json({ message: 'Menu item not found' });
        res.json(updatedItem);
    } catch (error) {
        console.error('[menuController.js][updateMenuItemByAdmin]', error);
        res.status(400).json({ message: error.message });
    }
};

// Admin: Delete menu item for a business by ownerId
const deleteMenuItemByAdmin = async (req, res) => {
    try {
        const { ownerId } = req.query;
        if (!ownerId) return res.status(400).json({ message: 'ownerId is required' });
        const Business = require('../models/businessModel');
        const business = await Business.findOne({ owner: ownerId });
        if (!business) return res.status(404).json({ message: 'Business not found for this owner' });
        const deleted = await Menu.findOneAndDelete({ _id: req.params.id, businessId: business._id });
        if (!deleted) return res.status(404).json({ message: 'Menu item not found' });
        res.json({ message: 'Menu item deleted' });
    } catch (error) {
        console.error('[menuController.js][deleteMenuItemByAdmin]', error);
        res.status(400).json({ message: error.message });
    }
};

// Admin: Get in-store menu for a business by ownerId
const getInstoreMenuByAdmin = async (req, res) => {
    try {
        const { ownerId } = req.query;
        if (!ownerId) return res.status(400).json({ message: 'ownerId is required' });
        const Business = require('../models/businessModel');
        const business = await Business.findOne({ owner: ownerId });
        if (!business) return res.status(404).json({ message: 'Business not found for this owner' });
        const menuItems = await Menu.find({ businessId: business._id });
        res.json({ menu: menuItems });
    } catch (error) {
        console.error('[menuController.js][getInstoreMenuByAdmin]', error);
        res.status(500).json({ message: 'Error fetching in-store menu', error: error.message });
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
    getAllMenuItemsByAdmin,
    createMenuItemByAdmin,
    updateMenuItemByAdmin,
    deleteMenuItemByAdmin,
    getInstoreMenuByAdmin,
};
