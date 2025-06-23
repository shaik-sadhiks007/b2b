const express = require('express');
const {
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
} = require('../controllers/menuController');
const authMiddleware = require('../middleware/authMiddleware');
const restaurantMiddleware = require('../middleware/restaurantMiddleware');

const router = express.Router();

// Get all menu items for a specific restaurant
router.get('/', authMiddleware, restaurantMiddleware, getMenu);

// Create a new category
router.post('/', authMiddleware, restaurantMiddleware, createCategory);

// Add subcategory to a category
router.post('/:categoryId/subcategories', authMiddleware, restaurantMiddleware, addSubcategory);

// Add item to a subcategory
router.post('/:categoryId/subcategories/:subcategoryId/items', authMiddleware, restaurantMiddleware, addItemToSubcategory);

// Bulk add items to a subcategory
router.post('/:categoryId/subcategories/:subcategoryId/items/bulk', authMiddleware, restaurantMiddleware, bulkAddItemsToSubcategory);

// Update a category
router.put('/:id', authMiddleware, restaurantMiddleware, updateCategory);

// Delete a category
router.delete('/:id', authMiddleware, restaurantMiddleware, deleteCategory);

// Delete a subcategory
router.delete('/:categoryId/subcategories/:subcategoryId', authMiddleware, restaurantMiddleware, deleteSubcategory);

// Delete an item from a subcategory
router.delete('/:categoryId/subcategories/:subcategoryId/items/:itemId', authMiddleware, restaurantMiddleware, deleteItemFromSubcategory);

// Delete multiple items from a subcategory
router.delete('/:categoryId/subcategories/:subcategoryId/items', authMiddleware, restaurantMiddleware, deleteMultipleItemsFromSubcategory);

// Update a subcategory
router.put('/:categoryId/subcategories/:subcategoryId', authMiddleware, restaurantMiddleware, updateSubcategory);

// Update an item in a subcategory
router.put('/:categoryId/subcategories/:subcategoryId/items/:itemId', authMiddleware, restaurantMiddleware, updateItemInSubcategory);

// Get menu items for a specific restaurant (public route - no auth required)
router.get('/public/:restaurantId', getPublicMenu);

module.exports = router;
