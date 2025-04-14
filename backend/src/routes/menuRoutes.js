const express = require('express');
const {
    createMenu,
    getTodayMenu,
    getMenuByDate,
    updateMenu,
    deleteMenu,
    getAllMenus,
    updateMenuByDate
} = require('../controllers/menuController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const Menu = require('../models/Menu');
const restaurantMiddleware = require('../middleware/restaurantMiddleware');

const router = express.Router();

// router.get('/today', getTodayMenu);
// router.get('/all-menus', getAllMenus);
// router.get('/:date', getMenuByDate);
// router.post('/', authMiddleware, adminMiddleware, createMenu); 
// router.put('/:date', authMiddleware, adminMiddleware, updateMenu);
// router.delete('/:date', authMiddleware, adminMiddleware, deleteMenu);
// router.put('/date/:date', authMiddleware, adminMiddleware, updateMenuByDate);

// Get all menu items for a specific restaurant
router.get('/', authMiddleware, restaurantMiddleware, async (req, res) => {
    try {
        console.log(req.restaurant._id,"restaurant details");
        const menu = await Menu.find({ restaurantId: req.restaurant._id });
        res.json(menu);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new category
router.post('/', authMiddleware, restaurantMiddleware, async (req, res) => {
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
});

// Add subcategory to a category
router.post('/:categoryId/subcategories', authMiddleware, restaurantMiddleware, async (req, res) => {
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
});

// Add item to a subcategory
router.post('/:categoryId/subcategories/:subcategoryId/items', authMiddleware, restaurantMiddleware, async (req, res) => {
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

        const newItem = {
            name: req.body.name,
            foodType: req.body.foodType,
            customisable: req.body.customisable || false,
            basePrice: req.body.basePrice,
            description: req.body.description,
            isVeg: req.body.isVeg,
            photos: req.body.photos || [],
            serviceType: req.body.serviceType,
            totalPrice: req.body.totalPrice,
            packagingCharges: req.body.packagingCharges,
            inStock: req.body.inStock !== undefined ? req.body.inStock : true
        };

        subcategory.items.push(newItem);
        const updatedCategory = await category.save();
        
        res.status(201).json(updatedCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update a category
router.put('/:id', authMiddleware, restaurantMiddleware, async (req, res) => {
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
});

// Delete a category
router.delete('/:id', authMiddleware, restaurantMiddleware, async (req, res) => {
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
});

// Delete a subcategory
router.delete('/:categoryId/subcategories/:subcategoryId', authMiddleware, restaurantMiddleware, async (req, res) => {
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
});

// Delete an item from a subcategory
router.delete('/:categoryId/subcategories/:subcategoryId/items/:itemId', authMiddleware, restaurantMiddleware, async (req, res) => {
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
});

// Update a subcategory
router.put('/:categoryId/subcategories/:subcategoryId', authMiddleware, restaurantMiddleware, async (req, res) => {
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

        // Update subcategory properties
        if (req.body.name) {
            subcategory.name = req.body.name;
        }

        const updatedCategory = await category.save();
        res.json(updatedCategory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get menu items for a specific restaurant (public route - no auth required)
router.get('/public/:restaurantId', async (req, res) => {
    try {
        const menu = await Menu.find({ 
            restaurantId: req.params.restaurantId 
        }).select('name subcategories');

        if (!menu || menu.length === 0) {
            return res.status(404).json({ message: 'Menu not found for this restaurant' });
        }

        // Format the response to include only necessary fields
        const formattedMenu = menu.map(category => ({
            _id: category._id,
            name: category.name,
            subcategories: category.subcategories.map(subcategory => ({
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
        }));

        res.json(formattedMenu);
    } catch (error) {
        console.error('Error getting public menu:', error);
        res.status(500).json({ message: 'Error getting menu', error: error.message });
    }
});

module.exports = router;
