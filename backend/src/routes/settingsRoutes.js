const express = require('express');
const router = express.Router();
const {
    createOrUpdateSettings,
    getSettings,
    calculateCheckoutCharges,
    insertSettings
} = require('../controllers/settingsController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Public route for calculating checkout charges (used by frontend)
router.post('/calculate-checkout', calculateCheckoutCharges);

// Direct insert route (for testing/initial setup - no auth required)
router.post('/insert', insertSettings);

// Admin routes for managing settings
router.get('/admin', authMiddleware, adminMiddleware, getSettings);
router.post('/admin', authMiddleware, adminMiddleware, createOrUpdateSettings);

module.exports = router; 