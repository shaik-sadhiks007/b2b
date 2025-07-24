const express = require('express');
const {
    getAllMenuItems,
    getMenuItem,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getAllMenuItemsOfPublic,
    getAllMenuItemsInstore,
    bulkCreateMenuItems,
    bulkDeleteMenuItems,
    getAllMenuItemsByAdmin,
    createMenuItemByAdmin,
    updateMenuItemByAdmin,
    deleteMenuItemByAdmin,
    getInstoreMenuByAdmin,
    bulkCreateMenuItemsByAdmin,
    bulkDeleteMenuItemsByAdmin
} = require('../controllers/menuController');
const authMiddleware = require('../middleware/authMiddleware');
const restaurantMiddleware = require('../middleware/restaurantMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();


router.get('/public/:id', getAllMenuItemsOfPublic);

router.get('/instore', authMiddleware, restaurantMiddleware, getAllMenuItemsInstore);


// Get a single menu item
router.get('/:id', authMiddleware, restaurantMiddleware, getMenuItem);


// Get all menu items for a business/restaurant
router.get('/', authMiddleware, restaurantMiddleware, getAllMenuItems);

// Create a new menu item
router.post('/', authMiddleware, restaurantMiddleware, createMenuItem);

// Create multiple menu items in bulk
router.post('/bulk', authMiddleware, restaurantMiddleware, bulkCreateMenuItems);

// Delete multiple menu items in bulk
router.delete('/bulk', authMiddleware, restaurantMiddleware, bulkDeleteMenuItems);

// Update a menu item
router.put('/:id', authMiddleware, restaurantMiddleware, updateMenuItem);

// Delete a menu item
router.delete('/:id', authMiddleware, restaurantMiddleware, deleteMenuItem);

// Rename a category
router.put('/category/rename', authMiddleware, restaurantMiddleware, require('../controllers/menuController').renameCategory);
// Rename a subcategory
router.put('/subcategory/rename', authMiddleware, restaurantMiddleware, require('../controllers/menuController').renameSubcategory);

// Admin menu routes
router.get('/admin/all', authMiddleware, adminMiddleware, getAllMenuItemsByAdmin);
// Admin bulk menu routes (must be above /admin/:id)
router.post('/admin/bulk', authMiddleware, adminMiddleware, bulkCreateMenuItemsByAdmin);
router.delete('/admin/bulk', authMiddleware, adminMiddleware, bulkDeleteMenuItemsByAdmin);
// Admin single item routes
router.post('/admin', authMiddleware, adminMiddleware, createMenuItemByAdmin);
router.put('/admin/:id', authMiddleware, adminMiddleware, updateMenuItemByAdmin);
router.delete('/admin/:id', authMiddleware, adminMiddleware, deleteMenuItemByAdmin);

// Admin: Get in-store menu for a business by ownerId
router.get('/admin/instore', authMiddleware, adminMiddleware, getInstoreMenuByAdmin);

module.exports = router;
