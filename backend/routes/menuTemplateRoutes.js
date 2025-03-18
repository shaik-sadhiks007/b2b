const express = require('express');
const router = express.Router();
const authMiddleware = require('../src/middleware/authMiddleware');
const {
    getMenuTemplates,
    getMenuTemplatesByCategory,
    createMenuTemplate,
    updateMenuTemplate,
    deleteMenuTemplate
} = require('../controllers/menuTemplateController');

// Public routes
router.get('/', getMenuTemplates);
router.get('/category/:category', getMenuTemplatesByCategory);

// Protected admin routes
router.post('/', authMiddleware, createMenuTemplate);
router.put('/:id', authMiddleware, updateMenuTemplate);
router.delete('/:id', authMiddleware, deleteMenuTemplate);

module.exports = router; 