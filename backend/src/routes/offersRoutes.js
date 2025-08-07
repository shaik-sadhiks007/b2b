const express = require('express');
const router = express.Router();

// Controllers
const offerController = require('../controllers/offerController');

// Middleware
const authMiddleware = require('../middleware/authMiddleware');         // Required to populate req.user
const restaurantMiddleware = require('../middleware/restaurantMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');       // Optional for future admin-only routes



// Create a new offer
router.post(
  '/business',
  authMiddleware,
  restaurantMiddleware,
  offerController.createOffer
);

// Get offers for the authenticated business (filtered: active, expired, upcoming)
router.get(
  '/business',
  authMiddleware,
  restaurantMiddleware,
  offerController.getBusinessOffers
);

// Update an existing offer
router.put(
  '/business/:id',
  authMiddleware,
  restaurantMiddleware,
  offerController.updateOffer
);

// Toggle status (active/inactive)
router.patch(
  '/business/:id/status',
  authMiddleware,
  restaurantMiddleware,
  offerController.toggleOfferStatus
);

// Delete an offer
router.delete(
  '/business/:id',
  authMiddleware,
  restaurantMiddleware,
  offerController.deleteOffer
);




// Get active offers for a specific menu item
router.get(
  '/public/item/:menuItemId',
  offerController.getActiveOffersForItem
);

// Get active offers for a specific business
router.get(
  '/public/business/:businessId',
  offerController.getActiveOffersForBusiness
);




module.exports = router;
