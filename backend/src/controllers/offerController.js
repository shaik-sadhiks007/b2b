const Offer = require('../models/offerModel');
const Menu = require('../models/menuModel');
const Business = require('../models/businessModel');


const validateOfferData = (offerType, offerData) => {
  const errors = [];

  switch (offerType) {
    case 'bulk-price':
      if (!offerData.purchaseQuantity || !offerData.discountedPrice) {
        errors.push('Purchase quantity and discounted price are required');
      }
      break;

    case 'buy-x-get-y-free':
      if (!offerData.buyQuantity || !offerData.freeQuantity) {
        errors.push('Buy quantity and free quantity are required');
      }
      break;

    default:
      errors.push('Invalid offer type');
  }

  if (!offerData.title?.trim()) {
    errors.push('Title is required');
  }

  if (offerData.endDate && offerData.startDate &&
      new Date(offerData.endDate) <= new Date(offerData.startDate)) {
    errors.push('End date must be after start date');
  }

  return errors;
};

const emitOfferEvent = (req, eventType, data) => {
  const io = req.app.get('io');
  if (io) {
    io.emit(`offer_${eventType.toLowerCase()}`, {
      businessId: req.restaurant?._id || data.businessId,
      ...data
    });
  }
};

const createOffer = async (req, res) => {
  try {
    const { menuItemId, offerType, ...offerData } = req.body;
    const restaurantId = req.restaurant._id;

    if (!menuItemId || !offerType) {
      return res.status(400).json({ success: false, message: 'Menu item ID and offer type are required' });
    }

    const menuItem = await Menu.findOne({ _id: menuItemId, businessId: restaurantId });
    if (!menuItem) {
      return res.status(404).json({ success: false, message: 'Menu item not found in your restaurant' });
    }

    const validationErrors = validateOfferData(offerType, offerData);
    if (validationErrors.length > 0) {
      return res.status(400).json({ success: false, errors: validationErrors });
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

    res.status(201).json({ success: true, data: newOffer, message: 'Offer created successfully' });
  } catch (error) {
    console.error('Offer creation error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getBusinessOffers = async (req, res) => {
  try {
    const { status = 'active', page = 1, limit = 10 } = req.query;
    const parsedPage = Math.max(1, parseInt(page));
    const parsedLimit = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (parsedPage - 1) * parsedLimit;
    const restaurantId = req.restaurant._id;

    const currentDate = new Date();
    let query = { businessId: restaurantId };

    if (status === 'active') {
      query.isActive = true;
      query.startDate = { $lte: currentDate };
      query.$or = [
        { endDate: { $exists: false } },
        { endDate: null },
        { endDate: { $gte: currentDate } }
      ];
    } else if (status === 'upcoming') {
      query.isActive = true;
      query.startDate = { $gt: currentDate };
    } else if (status === 'expired') {
      query.$or = [
        { isActive: false },
        { endDate: { $lt: currentDate } }
      ];
    } else {
      return res.status(400).json({ success: false, message: 'Invalid status filter' });
    }

    const [offers, total] = await Promise.all([
      Offer.find(query).populate('menuItemId', 'name totalPrice photos')
        .sort({ createdAt: -1 }).skip(skip).limit(parsedLimit),
      Offer.countDocuments(query)
    ]);

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
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const updateOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const restaurantId = req.restaurant._id;

    const existingOffer = await Offer.findOne({ _id: id, businessId: restaurantId });
    if (!existingOffer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    const menuItem = await Menu.findById(existingOffer.menuItemId);
    const validationErrors = validateOfferData(updateData.offerType || existingOffer.offerType, updateData);
    if (validationErrors.length > 0) {
      return res.status(400).json({ success: false, errors: validationErrors });
    }

    const updatedOffer = await Offer.findByIdAndUpdate(id, {
      ...updateData,
      title: updateData.title?.trim(),
      description: updateData.description?.trim(),
      updatedAt: new Date()
    }, { new: true, runValidators: true }).populate('menuItemId', 'name totalPrice photos');

    emitOfferEvent(req, 'UPDATED', { offer: updatedOffer });

    res.json({ success: true, data: updatedOffer, message: 'Offer updated successfully' });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
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
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    emitOfferEvent(req, offer.isActive ? 'ACTIVATED' : 'DEACTIVATED', { offer });

    res.json({
      success: true,
      data: offer,
      message: `Offer ${offer.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Toggle error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurantId = req.restaurant._id;

    const deleted = await Offer.findOneAndDelete({ _id: id, businessId: restaurantId });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    emitOfferEvent(req, 'DELETED', { offerId: id });

    res.json({ success: true, message: 'Offer deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getActiveOffersForItem = async (req, res) => {
  try {
    const { menuItemId } = req.params;

    const currentDate = new Date();
    const offers = await Offer.find({
      menuItemId,
      isActive: true,
      startDate: { $lte: currentDate },
      $or: [
        { endDate: { $exists: false } },
        { endDate: null },
        { endDate: { $gte: currentDate } }
      ]
    }).populate('menuItemId', 'name totalPrice photos');

    res.json({ success: true, data: offers });
  } catch (error) {
    console.error('Public item offers error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getActiveOffersForBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { category, limit = 10 } = req.query;

    const query = {
      businessId,
      isActive: true,
      startDate: { $lte: new Date() },
      $or: [
        { endDate: { $exists: false } },
        { endDate: null },
        { endDate: { $gte: new Date() } }
      ]
    };

    if (category) {
      const items = await Menu.find({ businessId, category: category.toLowerCase() }, '_id');
      query.menuItemId = { $in: items.map(i => i._id) };
    }

    const offers = await Offer.find(query)
      .populate('menuItemId', 'name totalPrice photos category')
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({ success: true, count: offers.length, data: offers });
  } catch (error) {
    console.error('Public business offers error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  createOffer,
  getBusinessOffers,
  updateOffer,
  toggleOfferStatus,
  deleteOffer,
  getActiveOffersForItem,
  getActiveOffersForBusiness
};
