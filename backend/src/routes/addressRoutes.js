const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const addressController = require('../controllers/addressController');

// Public route to get address
router.get('/', addressController.getAddress);

// Protected routes for admin
router.post('/', authMiddleware, addressController.createAddress);
router.put('/:id', authMiddleware, addressController.updateAddress);
router.delete('/:id', authMiddleware, addressController.deleteAddress);

module.exports = router; 