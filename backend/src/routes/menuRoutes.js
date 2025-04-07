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

const router = express.Router();

router.get('/today', getTodayMenu);
router.get('/all-menus', getAllMenus);
router.get('/:date', getMenuByDate);
router.post('/', authMiddleware, adminMiddleware, createMenu); 
router.put('/:date', authMiddleware, adminMiddleware, updateMenu);
router.delete('/:date', authMiddleware, adminMiddleware, deleteMenu);
router.put('/date/:date', authMiddleware, adminMiddleware, updateMenuByDate);

module.exports = router;
