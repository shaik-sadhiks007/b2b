const express = require('express');
const router = express.Router();
const {
  register,
  updateStatus,
  toggleOnline,
  getAll,
  updateStep,
  getProfile,
  updateProfile
} = require('../controllers/deliveryPartnerController.js');
const deliveryPartnerMiddleware = require('../middleware/deliveryPartnerMiddleware.js');
const authMiddleware = require('../middleware/authMiddleware.js');


router.get('/profile', authMiddleware, deliveryPartnerMiddleware, getProfile);

// Update delivery partner profile
router.patch('/profile', authMiddleware, deliveryPartnerMiddleware, updateProfile);

// Register a new delivery partner
router.post('/register', authMiddleware, register);

// Update registration step
router.patch('/:id/step', authMiddleware, deliveryPartnerMiddleware, updateStep);

// Update status (active/inactive/review)
router.patch('/:id/status', authMiddleware, deliveryPartnerMiddleware, updateStatus);

// Toggle online/offline
router.patch('/online', authMiddleware, deliveryPartnerMiddleware, toggleOnline);

// Get all delivery partners (admin)
router.get('/', authMiddleware, deliveryPartnerMiddleware, getAll);


module.exports = router;

