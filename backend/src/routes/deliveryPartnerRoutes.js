const express = require('express');
const router = express.Router();
const {
  register,
  updateStatus,
  toggleOnline,
  getAll,
  updateStep,
  getProfile,
  updateProfile,
  // Admin functions
  getAllDeliveryPartners,
  getDeliveryPartnerById,
  updateDeliveryPartnerStatus,
  getDeliveryPartnerStats,
  updateDeliveryPartnerByAdmin
} = require('../controllers/deliveryPartnerController.js');
const deliveryPartnerMiddleware = require('../middleware/deliveryPartnerMiddleware.js');
const authMiddleware = require('../middleware/authMiddleware.js');
const adminMiddleware = require('../middleware/adminMiddleware.js');


router.get('/profile', authMiddleware, deliveryPartnerMiddleware, getProfile);

// Update delivery partner profile
router.patch('/profile', authMiddleware, deliveryPartnerMiddleware, updateProfile);

// Register a new delivery partner
router.post('/register', authMiddleware, register);

// Update step
router.patch('/:id/step', authMiddleware, deliveryPartnerMiddleware, updateStep);

// Update status (active/inactive/review)
router.patch('/:id/status', authMiddleware, deliveryPartnerMiddleware, updateStatus);

// Toggle online/offline
router.patch('/online', authMiddleware, deliveryPartnerMiddleware, toggleOnline);

// Get all delivery partners (admin)
router.get('/', authMiddleware, deliveryPartnerMiddleware, getAll);

// ===== ADMIN ROUTES =====
// Get all delivery partners with pagination and filters (admin only)
router.get('/admin/all', authMiddleware, adminMiddleware, getAllDeliveryPartners);

// Get delivery partner by ID (admin only)
router.get('/admin/:id', authMiddleware, adminMiddleware, getDeliveryPartnerById);

// Update delivery partner status (admin only)
router.patch('/admin/:id/status', authMiddleware, adminMiddleware, updateDeliveryPartnerStatus);

// Update delivery partner data (admin only)
router.patch('/admin/:id', authMiddleware, adminMiddleware, updateDeliveryPartnerByAdmin);

// Get delivery partner statistics (admin only)
router.get('/admin/stats', authMiddleware, adminMiddleware, getDeliveryPartnerStats);

module.exports = router;

