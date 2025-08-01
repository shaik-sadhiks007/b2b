const express = require('express');
const {
    createOffer,
    getBusinessOffers,
    updateOffer,
    toggleOfferStatus,
    deleteOffer,
    getActiveOffersForItem,
    getActiveOffersForBusiness,
    // Admin functions
    getBusinessOffersByAdmin,
    createOfferByAdmin,
    updateOfferByAdmin,
    deleteOfferByAdmin
} = require('../controllers/offersController');
const authMiddleware = require('../middleware/authMiddleware');
const restaurantMiddleware = require('../middleware/restaurantMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

// Public routes
router.get('/item/:menuItemId', getActiveOffersForItem);
router.get('/business/:businessId', getActiveOffersForBusiness);

// Business owner routes
router.post('/', authMiddleware, restaurantMiddleware, createOffer);
router.get('/business', authMiddleware, restaurantMiddleware, getBusinessOffers);
router.put('/:id', authMiddleware, restaurantMiddleware, updateOffer);
router.patch('/:id/toggle-status', authMiddleware, restaurantMiddleware, toggleOfferStatus);
router.delete('/:id', authMiddleware, restaurantMiddleware, deleteOffer);

// Admin routes
router.get('/admin/business/:ownerId', authMiddleware, adminMiddleware, getBusinessOffersByAdmin);
router.post('/admin', authMiddleware, adminMiddleware, createOfferByAdmin);
router.put('/admin/:id', authMiddleware, adminMiddleware, updateOfferByAdmin);
router.delete('/admin/:id', authMiddleware, adminMiddleware, deleteOfferByAdmin);

module.exports = router;