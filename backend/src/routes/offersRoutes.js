// routes/offerRoutes.js
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Controllers
const offerController = require('../controllers/offerController');

// Middleware you already have
const authMiddleware = require('../middleware/authMiddleware');           // sets req.user
const restaurantMiddleware = require('../middleware/restaurantMiddleware'); // sets req.restaurant



// Async wrapper to avoid try/catch in routes
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Validate ObjectId params like :id, :menuItemId, :businessId
const validateObjectId = (paramName) => (req, res, next) => {
  const id = req.params[paramName];
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: `Invalid ${paramName}` });
  }
  next();
};

// Basic body validation (lightweight; controller still does deep validation)
const validateOfferBody = (req, res, next) => {
  const { menuItemId, offerType, title } = req.body || {};

  if (req.method === 'POST') {
    if (!menuItemId) {
      return res.status(400).json({ success: false, message: 'menuItemId required' });
    }
    if (!offerType) {
      return res.status(400).json({ success: false, message: 'offerType required' });
    }
  }

  if (title != null && !String(title).trim()) {
    return res.status(400).json({ success: false, message: 'title cannot be empty' });
  }

  next();
};

// Optional short cache for public GETs
const shortPublicCache = (req, res, next) => {
  res.set('Cache-Control', 'public, max-age=60');
  next();
};



// Create a new offer
router.post(
  '/business',
  authMiddleware,
  restaurantMiddleware,
  validateOfferBody,
  asyncHandler(offerController.createOffer)
);

// Get offers for the authenticated business (active | expired | upcoming)
router.get(
  '/business',
  authMiddleware,
  restaurantMiddleware,
  asyncHandler(offerController.getBusinessOffers)
);

// Update an existing offer
router.put(
  '/business/:id',
  authMiddleware,
  restaurantMiddleware,
  validateObjectId('id'),
  validateOfferBody,
  asyncHandler(offerController.updateOffer)
);

// Toggle status (active/inactive)
router.patch(
  '/business/:id/status',
  authMiddleware,
  restaurantMiddleware,
  validateObjectId('id'),
  asyncHandler(offerController.toggleOfferStatus)
);

// Delete an offer
router.delete(
  '/business/:id',
  authMiddleware,
  restaurantMiddleware,
  validateObjectId('id'),
  asyncHandler(offerController.deleteOffer)
);



// Get active offers for a specific menu item
router.get(
  '/public/item/:menuItemId',
  validateObjectId('menuItemId'),
  shortPublicCache,
  asyncHandler(offerController.getActiveOffersForItem)
);

// Get active offers for a specific business
router.get(
  '/public/business/:businessId',
  validateObjectId('businessId'),
  shortPublicCache,
  asyncHandler(offerController.getActiveOffersForBusiness)
);

module.exports = router;
