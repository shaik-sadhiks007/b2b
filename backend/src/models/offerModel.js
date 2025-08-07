const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Menu',
    required: true
  },
  offerType: {
    type: String,
    enum: ['bulk-price', 'buy-x-get-y-free'],
    required: true
  },

  // Common fields
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 200
  },

  // For bulk-price offer: Buy X for ₹Y
  purchaseQuantity: {
    type: Number,
    min: 1,
    required: function () {
      return this.offerType === 'bulk-price';
    }
  },
  discountedPrice: {
    type: Number,
    min: 1,
    required: function () {
      return this.offerType === 'bulk-price';
    }
  },

  // For buy-x-get-y-free offer
  buyQuantity: {
    type: Number,
    min: 1,
    required: function () {
      return this.offerType === 'buy-x-get-y-free';
    }
  },
  freeQuantity: {
    type: Number,
    min: 1,
    required: function () {
      return this.offerType === 'buy-x-get-y-free';
    }
  },

  // Validity period
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});


offerSchema.index({ menuItemId: 1 });
offerSchema.index({ businessId: 1 });
offerSchema.index({ isActive: 1, startDate: 1, endDate: 1 });


offerSchema.pre('save', function (next) {
  if (this.endDate && this.endDate <= this.startDate) {
    return next(new Error('End date must be after start date'));
  }

  next();
});



offerSchema.statics.getActiveOffersForItem = function (menuItemId) {
  return this.find({
    menuItemId,
    isActive: true,
    startDate: { $lte: new Date() },
    $or: [
      { endDate: { $gte: new Date() } },
      { endDate: { $exists: false } }
    ]
  }).populate('menuItemId', 'name totalPrice');
};



offerSchema.statics.getActiveOffersForBusiness = function (businessId) {
  return this.find({
    businessId,
    isActive: true,
    startDate: { $lte: new Date() },
    $or: [
      { endDate: { $gte: new Date() } },
      { endDate: { $exists: false } }
    ]
  }).populate('menuItemId', 'name totalPrice category');
};



const Offer = mongoose.models.Offer || mongoose.model('Offer', offerSchema);
module.exports = Offer;
