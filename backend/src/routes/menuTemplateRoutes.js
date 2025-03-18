const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
    getMenuTemplates,
    createMenuTemplate,
    updateMenuTemplate,
    deleteMenuTemplate
} = require('../controllers/menuTemplateController');

// Public routes
router.get('/', getMenuTemplates);

// Protected admin routes
router.post('/', authMiddleware, createMenuTemplate);
router.put('/:id', authMiddleware, updateMenuTemplate);
router.delete('/:id', authMiddleware, deleteMenuTemplate);

module.exports = router; 