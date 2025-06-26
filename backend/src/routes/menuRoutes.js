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
    bulkDeleteMenuItems
} = require('../controllers/menuController');
const authMiddleware = require('../middleware/authMiddleware');
const restaurantMiddleware = require('../middleware/restaurantMiddleware');

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

module.exports = router;
