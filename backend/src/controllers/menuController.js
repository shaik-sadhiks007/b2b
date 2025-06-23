const Menu = require('../models/menuModel');
const { cloudinary, uploadMultipleBase64Images } = require('../config/cloudinary');

// Get all menu items for a specific restaurant
const getMenu = async (req, res) => {
    try {
        const menu = await Menu.find({ restaurantId: req.restaurant._id });
        res.json(menu);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new category
const createCategory = async (req, res) => {
    try {
        const newCategory = new Menu({
            name: req.body.name,
            isExpanded: true,
            subcategories: [],
            restaurantId: req.restaurant._id
        });
        const savedCategory = await newCategory.save();
        res.status(201).json(savedCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Add subcategory to a category
const addSubcategory = async (req, res) => {
    try {
        const category = await Menu.findOne({
            _id: req.params.categoryId,
            restaurantId: req.restaurant._id
        });
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        const newSubcategory = {
            name: req.body.name,
            items: []
        };
        category.subcategories.push(newSubcategory);
        const updatedCategory = await category.save();
        res.status(201).json(updatedCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Add item to a subcategory
const addItemToSubcategory = async (req, res) => {
    try {
        const category = await Menu.findOne({
            _id: req.params.categoryId,
            restaurantId: req.restaurant._id
        });
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        const subcategory = category.subcategories.id(req.params.subcategoryId);
        if (!subcategory) {
            return res.status(404).json({ message: 'Subcategory not found' });
        }
        let photoUrls = [];
        if (req.body.photos && req.body.photos.length > 0) {
            photoUrls = await uploadMultipleBase64Images(req.body.photos);
        }
        if (!req.body.name || !req.body.basePrice) {
            return res.status(400).json({ message: 'Name and base price are required' });
        }
        const newItem = {
            name: req.body.name,
            foodType: req.body.foodType || 'regular',
            customisable: req.body.customisable || false,
            basePrice: parseFloat(req.body.basePrice),
            description: req.body.description || '',
            isVeg: req.body.isVeg || false,
            photos: photoUrls,
            serviceType: req.body.serviceType || 'DINE_IN',
            totalPrice: parseFloat(req.body.totalPrice) || parseFloat(req.body.basePrice),
            packagingCharges: parseFloat(req.body.packagingCharges) || 0,
            inStock: req.body.inStock !== undefined ? req.body.inStock : true,
            quantity: req.body.quantity || 100
        };
        subcategory.items.push(newItem);
        const savedCategory = await category.save();
        const updatedSubcategory = savedCategory.subcategories.id(req.params.subcategoryId);
        const savedItem = updatedSubcategory.items[updatedSubcategory.items.length - 1];
        res.status(201).json(savedItem);
    } catch (error) {
        console.error('Error in item creation:', error);
        res.status(400).json({
            message: error.message,
            details: 'Error occurred while creating menu item'
        });
    }
};

// Bulk add items to a subcategory
const bulkAddItemsToSubcategory = async (req, res) => {
    try {
        const { items } = req.body;
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'No items provided' });
        }
        const category = await Menu.findOne({
            _id: req.params.categoryId,
            restaurantId: req.restaurant._id
        });
        if (!category) return res.status(404).json({ message: 'Category not found' });
        const subcategory = category.subcategories.id(req.params.subcategoryId);
        if (!subcategory) return res.status(404).json({ message: 'Subcategory not found' });
        subcategory.items.push(...items);
        await category.save();
        res.json({ message: 'Items added successfully', items: subcategory.items.slice(-items.length) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a category
const updateCategory = async (req, res) => {
    try {
        const category = await Menu.findOne({
            _id: req.params.id,
            restaurantId: req.restaurant._id
        });
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        const updatedCategory = await Menu.findByIdAndUpdate(
            req.params.id,
            { ...req.body, restaurantId: req.restaurant._id },
            { new: true }
        );
        res.json(updatedCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a category
const deleteCategory = async (req, res) => {
    try {
        const category = await Menu.findOne({
            _id: req.params.id,
            restaurantId: req.restaurant._id
        });
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        await Menu.findByIdAndDelete(req.params.id);
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a subcategory
const deleteSubcategory = async (req, res) => {
    try {
        const category = await Menu.findOne({
            _id: req.params.categoryId,
            restaurantId: req.restaurant._id
        });
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        const subcategory = category.subcategories.id(req.params.subcategoryId);
        if (!subcategory) {
            return res.status(404).json({ message: 'Subcategory not found' });
        }
        category.subcategories.pull(req.params.subcategoryId);
        await category.save();
        res.json({ message: 'Subcategory deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete an item from a subcategory
const deleteItemFromSubcategory = async (req, res) => {
    try {
        const category = await Menu.findOne({
            _id: req.params.categoryId,
            restaurantId: req.restaurant._id
        });
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        const subcategory = category.subcategories.id(req.params.subcategoryId);
        if (!subcategory) {
            return res.status(404).json({ message: 'Subcategory not found' });
        }
        const item = subcategory.items.id(req.params.itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        subcategory.items.pull(req.params.itemId);
        await category.save();
        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete multiple items from a subcategory
const deleteMultipleItemsFromSubcategory = async (req, res) => {
    try {
        const { itemIds } = req.body;
        const category = await Menu.findOne({
            _id: req.params.categoryId,
            restaurantId: req.restaurant._id
        });
        if (!category) return res.status(404).json({ message: 'Category not found' });
        const subcategory = category.subcategories.id(req.params.subcategoryId);
        if (!subcategory) return res.status(404).json({ message: 'Subcategory not found' });
        subcategory.items = subcategory.items.filter(item => !itemIds.includes(item._id.toString()));
        await category.save();
        res.json({ message: 'Items deleted successfully', deleted: itemIds });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a subcategory
const updateSubcategory = async (req, res) => {
    try {
        const category = await Menu.findOne({
            _id: req.params.categoryId,
            restaurantId: req.restaurant._id
        });
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        const subcategory = category.subcategories.id(req.params.subcategoryId);
        if (!subcategory) {
            return res.status(404).json({ message: 'Subcategory not found' });
        }
        if (req.body.name) {
            subcategory.name = req.body.name;
        }
        const updatedCategory = await category.save();
        res.json(updatedCategory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update an item in a subcategory
const updateItemInSubcategory = async (req, res) => {
    try {
        const category = await Menu.findOne({
            _id: req.params.categoryId,
            restaurantId: req.restaurant._id
        });
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        const subcategory = category.subcategories.id(req.params.subcategoryId);
        if (!subcategory) {
            return res.status(404).json({ message: 'Subcategory not found' });
        }
        const item = subcategory.items.id(req.params.itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        let photoUrls = item.photos;
        if (req.body.photos && req.body.photos.length > 0) {
            for (const oldPhotoUrl of item.photos) {
                try {
                    const publicId = oldPhotoUrl.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(publicId);
                } catch (deleteError) {
                    console.error('Error deleting old image from Cloudinary:', deleteError);
                }
            }
            photoUrls = await uploadMultipleBase64Images(req.body.photos);
        }
        item.name = req.body.name || item.name;
        item.foodType = req.body.foodType || item.foodType;
        item.customisable = req.body.customisable !== undefined ? req.body.customisable : item.customisable;
        item.basePrice = req.body.basePrice ? parseFloat(req.body.basePrice) : item.basePrice;
        item.description = req.body.description || item.description;
        item.isVeg = req.body.isVeg !== undefined ? req.body.isVeg : item.isVeg;
        item.photos = photoUrls;
        item.serviceType = req.body.serviceType || item.serviceType;
        item.totalPrice = req.body.totalPrice ? parseFloat(req.body.totalPrice) : item.totalPrice;
        item.packagingCharges = req.body.packagingCharges ? parseFloat(req.body.packagingCharges) : item.packagingCharges;
        item.inStock = req.body.inStock !== undefined ? req.body.inStock : item.inStock;
        item.quantity = req.body.quantity ? parseFloat(req.body.quantity) : item.quantity;
        const updatedCategory = await category.save();
        const updatedSubcategory = updatedCategory.subcategories.id(req.params.subcategoryId);
        const updatedItem = updatedSubcategory.items.id(req.params.itemId);
        res.json(updatedItem);
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(400).json({
            message: error.message,
            details: 'Error occurred while updating menu item'
        });
    }
};

// Get menu items for a specific restaurant (public route - no auth required)
const getPublicMenu = async (req, res) => {
    try {
        const menu = await Menu.find({
            restaurantId: req.params.restaurantId
        }).select('name subcategories');
        if (!menu || menu.length === 0) {
            return res.status(404).json({ message: 'Menu not found for this restaurant' });
        }
        const formattedMenu = menu
            .map(category => ({
                _id: category._id,
                name: category.name,
                subcategories: category.subcategories
                    .filter(subcategory => subcategory.items && subcategory.items.length > 0)
                    .map(subcategory => ({
                        _id: subcategory._id,
                        name: subcategory.name,
                        items: subcategory.items.map(item => ({
                            _id: item._id,
                            name: item.name,
                            description: item.description,
                            isVeg: item.isVeg,
                            customisable: item.customisable,
                            basePrice: item.basePrice,
                            totalPrice: item.totalPrice,
                            packagingCharges: item.packagingCharges,
                            inStock: item.inStock,
                            photos: item.photos
                        }))
                    }))
            }))
            .filter(category => category.subcategories.length > 0);
        res.json(formattedMenu);
    } catch (error) {
        console.error('Error getting public menu:', error);
        res.status(500).json({ message: 'Error getting menu', error: error.message });
    }
};

module.exports = {
    getMenu,
    createCategory,
    addSubcategory,
    addItemToSubcategory,
    bulkAddItemsToSubcategory,
    updateCategory,
    deleteCategory,
    deleteSubcategory,
    deleteItemFromSubcategory,
    deleteMultipleItemsFromSubcategory,
    updateSubcategory,
    updateItemInSubcategory,
    getPublicMenu
};
