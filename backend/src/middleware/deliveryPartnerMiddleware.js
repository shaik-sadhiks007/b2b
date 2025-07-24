const DeliveryPartner = require('../models/deliveryPartnerModel');

const deliveryPartnerMiddleware = async (req, res, next) => {
  try {
    // Get the user ID from the authenticated user
    const userId = req.user && req.user.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Find the delivery partner using the user's ID (user field)
    const partner = await DeliveryPartner.findOne({ user: userId }).select('-__v');

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Delivery partner not found for this user'
      });
    }

    // Attach the delivery partner to the request object
    req.deliveryPartner = partner;
    next();
  } catch (error) {
    console.error('DeliveryPartner middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = deliveryPartnerMiddleware;
