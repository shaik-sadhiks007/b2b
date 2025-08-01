const Offer = require('../models/offerModel');
const Menu = require('../models/menuModel');
const Business = require('../models/businessModel');

// Utility Functions
const validateOfferData = (offerType, offerData, menuItem) => {
  const errors = [];
  
  switch (offerType) {
    case 'bulk-price':
      if (!offerData.purchaseQuantity || !offerData.discountedPrice) {
        errors.push('Purchase quantity and discounted price are required');
      } else {
        const originalPrice = menuItem.totalPrice * offerData.purchaseQuantity;
        if (offerData.discountedPrice >= originalPrice) {
          errors.push('Discounted price must be less than original price');
        }
        if (offerData.purchaseQuantity <= 1) {
          errors.push('Purchase quantity must be greater than 1 for bulk pricing');
        }
      }
      break;

    case 'buy-x-get-y-free':
      if (!offerData.buyQuantity || !offerData.freeQuantity) {
        errors.push('Buy quantity and free quantity are required');
      }
      if (offerData.buyQuantity <= 0 || offerData.freeQuantity <= 0) {
        errors.push('Quantities must be positive numbers');
      }
      if (offerData.freeQuantity >= offerData.buyQuantity && offerData.buyQuantity !== 1) {
        errors.push('Free quantity should generally be less than purchase quantity');
      }
      break;

    default:
      errors.push('Invalid offer type');
  }

  if (!offerData.title?.trim()) {
    errors.push('Title is required');
  }

  if (offerData.startDate && new Date(offerData.startDate) < new Date()) {
    errors.push('Start date cannot be in the past');
  }
  
  if (offerData.endDate && offerData.startDate && 
      new Date(offerData.endDate) <= new Date(offerData.startDate)) {
    errors.push('End date must be after start date');
  }

  return errors;
};

const emitOfferEvent = (req, eventType, data) => {
  if (req.app.get('io')) {
    req.app.get('io').emit(`offer_${eventType.toLowerCase()}`, {
      businessId: req.restaurant?._id || data.businessId,
      ...data
    });
  }
};

// Business Owner Controllers
const getBusinessOffers = async (req, res) => {
  try {
    // 1. Validate and sanitize input parameters
    const { status = 'active', page = 1, limit = 10 } = req.query;
    const parsedPage = Math.max(1, parseInt(page));
    const parsedLimit = Math.min(50, Math.max(1, parseInt(limit))); // Enforce max limit of 50
    const skip = (parsedPage - 1) * parsedLimit;

    // 2. Verify restaurant exists
    const restaurantId = req.restaurant._id;
    const restaurantExists = await Business.exists({ _id: restaurantId });
    if (!restaurantExists) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // 3. Build the query with better date handling
    const currentDate = new Date();
    let query = { businessId: restaurantId };
    
    switch (status.toLowerCase()) {
      case 'active':
        query.isActive = true;
        query.$or = [
          { endDate: { $exists: false } },
          { endDate: null },
          { endDate: { $gte: currentDate } }
        ];
        query.startDate = { $lte: currentDate };
        break;
        
      case 'upcoming':
        query.isActive = true;
        query.startDate = { $gt: currentDate };
        break;
        
      case 'expired':
        query.$or = [
          { isActive: false },
          { endDate: { $lt: currentDate } }
        ];
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid status parameter. Use "active", "upcoming", or "expired"'
        });
    }

    // 4. Execute queries in parallel
    const [offers, total] = await Promise.all([
      Offer.find(query)
        .populate('menuItemId', 'name totalPrice photos')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit),
        
      Offer.countDocuments(query)
    ]);

    // 5. Return standardized response
    res.json({
      success: true,
      data: offers,
      pagination: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit),
        hasMore: (parsedPage * parsedLimit) < total
      }
    });
    
  } catch (error) {
    console.error('Get offers error:', error);
    
    // 6. Improved error handling
    const errorMessage = error.name === 'CastError' 
      ? 'Invalid ID format'
      : 'Server error fetching offers';
      
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const createOffer = async (req, res) => {
  try {
    const { menuItemId, offerType, ...offerData } = req.body;
    const restaurantId = req.restaurant._id;

    if (!menuItemId || !offerType) {
      return res.status(400).json({ 
        success: false,
        message: 'Menu item ID and offer type are required' 
      });
    }

    const menuItem = await Menu.findOne({
      _id: menuItemId,
      businessId: restaurantId
    }).lean();

    if (!menuItem) {
      return res.status(404).json({ 
        success: false,
        message: 'Menu item not found in your restaurant' 
      });
    }

    const validationErrors = validateOfferData(offerType, offerData, menuItem);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Offer validation failed',
        errors: validationErrors
      });
    }

    const newOffer = await Offer.create({
      menuItemId: menuItem._id,
      businessId: restaurantId,
      offerType,
      ...offerData,
      title: offerData.title.trim(),
      description: offerData.description?.trim(),
      isActive: offerData.isActive !== false,
      startDate: offerData.startDate || new Date()
    });

    emitOfferEvent(req, 'CREATED', { offer: newOffer });

    res.status(201).json({
      success: true,
      data: newOffer,
      message: 'Offer created successfully'
    });
  } catch (error) {
    console.error('Offer creation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error creating offer',
      error: error.message 
    });
  }
};

const updateOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const restaurantId = req.restaurant._id;

    const existingOffer = await Offer.findOne({
      _id: id,
      businessId: restaurantId
    });
    
    if (!existingOffer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found in your restaurant'
      });
    }

    let menuItem;
    if (updateData.menuItemId && updateData.menuItemId !== existingOffer.menuItemId.toString()) {
      menuItem = await Menu.findOne({
        _id: updateData.menuItemId,
        businessId: restaurantId
      });
      
      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: 'New menu item not found in your restaurant'
        });
      }
    } else {
      menuItem = await Menu.findById(existingOffer.menuItemId);
    }

    if (updateData.offerType && updateData.offerType !== existingOffer.offerType) {
      const validationErrors = validateOfferData(
        updateData.offerType, 
        updateData, 
        menuItem
      );
      
      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Offer validation failed',
          errors: validationErrors
        });
      }
    }

    const updateFields = {
      ...updateData,
      updatedAt: new Date()
    };

    if (updateData.title) updateFields.title = updateData.title.trim();
    if (updateData.description) updateFields.description = updateData.description.trim();

    const updatedOffer = await Offer.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    ).populate('menuItemId', 'name totalPrice photos');

    emitOfferEvent(req, 'UPDATED', { offer: updatedOffer });

    res.json({
      success: true,
      data: updatedOffer,
      message: 'Offer updated successfully'
    });
  } catch (error) {
    console.error('Update offer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating offer',
      error: error.message
    });
  }
};

const toggleOfferStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurantId = req.restaurant._id;

    const offer = await Offer.findOneAndUpdate(
      { _id: id, businessId: restaurantId },
      [{ $set: { isActive: { $not: "$isActive" }, updatedAt: new Date() } }],
      { new: true }
    );
    
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found in your restaurant'
      });
    }

    emitOfferEvent(req, offer.isActive ? 'ACTIVATED' : 'DEACTIVATED', { offer });

    res.json({
      success: true,
      data: offer,
      message: `Offer ${offer.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Toggle offer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error toggling offer',
      error: error.message
    });
  }
};

const deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurantId = req.restaurant._id;

    const deletedOffer = await Offer.findOneAndDelete({
      _id: id,
      businessId: restaurantId
    });
    
    if (!deletedOffer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found in your restaurant'
      });
    }

    emitOfferEvent(req, 'DELETED', { offerId: id });

    res.json({
      success: true,
      data: {},
      message: 'Offer deleted successfully'
    });
  } catch (error) {
    console.error('Delete offer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting offer',
      error: error.message
    });
  }
};

// Admin Controllers
const getBusinessOffersByAdmin = async (req, res) => {
  try {
    const { businessId, status = 'active', page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    if (!businessId) {
      return res.status(400).json({
        success: false,
        message: 'Business ID is required'
      });
    }

    let query = { businessId };
    
    if (status === 'active') {
      query.isActive = true;
      query.$or = [
        { endDate: { $exists: false } },
        { endDate: null },
        { endDate: { $gte: new Date() } }
      ];
      query.startDate = { $lte: new Date() };
    } else if (status === 'upcoming') {
      query.isActive = true;
      query.startDate = { $gt: new Date() };
    } else if (status === 'expired') {
      query.$or = [
        { isActive: false },
        { endDate: { $lt: new Date() } }
      ];
    }

    const [offers, total] = await Promise.all([
      Offer.find(query)
        .populate('menuItemId', 'name totalPrice photos')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Offer.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: offers,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin get offers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching offers',
      error: error.message
    });
  }
};

const createOfferByAdmin = async (req, res) => {
  try {
    const { businessId, menuItemId, offerType, ...offerData } = req.body;

    if (!businessId || !menuItemId || !offerType) {
      return res.status(400).json({
        success: false,
        message: 'Business ID, menu item ID and offer type are required'
      });
    }

    const menuItem = await Menu.findOne({
      _id: menuItemId,
      businessId
    }).lean();

    if (!menuItem) {
      return res.status(404).json({ 
        success: false,
        message: 'Menu item not found in specified business' 
      });
    }

    const validationErrors = validateOfferData(offerType, offerData, menuItem);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Offer validation failed',
        errors: validationErrors
      });
    }

    const newOffer = await Offer.create({
      menuItemId: menuItem._id,
      businessId,
      offerType,
      ...offerData,
      title: offerData.title.trim(),
      description: offerData.description?.trim(),
      isActive: offerData.isActive !== false,
      startDate: offerData.startDate || new Date()
    });

    res.status(201).json({
      success: true,
      data: newOffer,
      message: 'Offer created successfully by admin'
    });
  } catch (error) {
    console.error('Admin offer creation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error creating offer',
      error: error.message 
    });
  }
};

const updateOfferByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { businessId, ...updateData } = req.body;

    if (!businessId) {
      return res.status(400).json({
        success: false,
        message: 'Business ID is required'
      });
    }

    const existingOffer = await Offer.findOne({
      _id: id,
      businessId
    });
    
    if (!existingOffer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found in specified business'
      });
    }

    let menuItem;
    if (updateData.menuItemId && updateData.menuItemId !== existingOffer.menuItemId.toString()) {
      menuItem = await Menu.findOne({
        _id: updateData.menuItemId,
        businessId
      });
      
      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: 'New menu item not found in specified business'
        });
      }
    } else {
      menuItem = await Menu.findById(existingOffer.menuItemId);
    }

    if (updateData.offerType && updateData.offerType !== existingOffer.offerType) {
      const validationErrors = validateOfferData(
        updateData.offerType, 
        updateData, 
        menuItem
      );
      
      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Offer validation failed',
          errors: validationErrors
        });
      }
    }

    const updateFields = {
      ...updateData,
      updatedAt: new Date()
    };

    if (updateData.title) updateFields.title = updateData.title.trim();
    if (updateData.description) updateFields.description = updateData.description.trim();

    const updatedOffer = await Offer.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    ).populate('menuItemId', 'name totalPrice photos');

    res.json({
      success: true,
      data: updatedOffer,
      message: 'Offer updated successfully by admin'
    });
  } catch (error) {
    console.error('Admin update offer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating offer',
      error: error.message
    });
  }
};

const deleteOfferByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { businessId } = req.body;

    if (!businessId) {
      return res.status(400).json({
        success: false,
        message: 'Business ID is required'
      });
    }

    const deletedOffer = await Offer.findOneAndDelete({
      _id: id,
      businessId
    });
    
    if (!deletedOffer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found in specified business'
      });
    }

    res.json({
      success: true,
      data: {},
      message: 'Offer deleted successfully by admin'
    });
  } catch (error) {
    console.error('Admin delete offer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting offer',
      error: error.message
    });
  }
};

// Public Controllers
const getActiveOffersForItem = async (req, res) => {
  try {
    const { menuItemId } = req.params;
    const { includeInactive = 'false' } = req.query;

    const menuItem = await Menu.findById(menuItemId);
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    const currentDate = new Date();
    let query = { menuItemId };

    if (includeInactive !== 'true') {
      query.isActive = true;
      query.startDate = { $lte: currentDate };
      query.$or = [
        { endDate: { $exists: false } },
        { endDate: null },
        { endDate: { $gte: currentDate } }
      ];
    }

    const offers = await Offer.find(query)
      .populate('menuItemId', 'name totalPrice photos')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: offers
    });
  } catch (error) {
    console.error('Get item offers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching item offers',
      error: error.message
    });
  }
};

const getActiveOffersForBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { category, limit = 10 } = req.query;

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    const currentDate = new Date();
    const query = { 
      businessId,
      isActive: true,
      startDate: { $lte: currentDate },
      $or: [
        { endDate: { $exists: false } },
        { endDate: null },
        { endDate: { $gte: currentDate } }
      ]
    };

    if (category) {
      const menuItems = await Menu.find({ 
        businessId, 
        category: category.toLowerCase() 
      }, '_id');
      query.menuItemId = { $in: menuItems.map(item => item._id) };
    }

    const offers = await Offer.find(query)
      .populate('menuItemId', 'name totalPrice photos category')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({
      success: true,
      count: offers.length,
      data: offers
    });
  } catch (error) {
    console.error('Get business offers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching business offers',
      error: error.message
    });
  }
};

module.exports = {
  // Business Owner
  createOffer,
  getBusinessOffers,
  updateOffer,
  toggleOfferStatus,
  deleteOffer,
  
  // Public
  getActiveOffersForItem,
  getActiveOffersForBusiness,
  
  // Admin
  getBusinessOffersByAdmin,
  createOfferByAdmin,
  updateOfferByAdmin,
  deleteOfferByAdmin
};