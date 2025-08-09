// models/offerModel.js
const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Menu',
      required: true,
      index: true,
    },

    offerType: {
      type: String,
      enum: ['bulk-price', 'buy-x-get-y-free'],
      required: true,
      index: true,
    },

    // Common fields
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200,
      default: '',
    },

    // bulk-price: Buy X for ₹Y
    purchaseQuantity: {
      type: Number,
      min: 1,
      required: function () {
        return this.offerType === 'bulk-price';
      },
    },
    discountedPrice: {
      type: Number,
      min: 0, // allow 0 for free bundles if you want
      required: function () {
        return this.offerType === 'bulk-price';
      },
    },

    // buy-x-get-y-free
    buyQuantity: {
      type: Number,
      min: 1,
      required: function () {
        return this.offerType === 'buy-x-get-y-free';
      },
    },
    freeQuantity: {
      type: Number,
      min: 1,
      required: function () {
        return this.offerType === 'buy-x-get-y-free';
      },
    },

    // Validity period
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    endDate: {
      type: Date,
      // optional
    },
  },
  { timestamps: true }
);

// Helpful indexes for your queries
offerSchema.index({ businessId: 1, isActive: 1, startDate: 1, endDate: 1 });
offerSchema.index({ businessId: 1, menuItemId: 1, isActive: 1 });

// Validate cross-field logic & dates on create + update
offerSchema.pre('validate', function (next) {
  // endDate after startDate
  if (this.endDate && this.startDate && this.endDate <= this.startDate) {
    return next(new Error('End date must be after start date'));
  }

  // Enforce required combos & clear irrelevant fields
  if (this.offerType === 'bulk-price') {
    if (!this.purchaseQuantity || !this.discountedPrice) {
      return next(new Error('purchaseQuantity and discountedPrice are required for bulk-price offers'));
    }
    this.buyQuantity = undefined;
    this.freeQuantity = undefined;
  } else if (this.offerType === 'buy-x-get-y-free') {
    if (!this.buyQuantity || !this.freeQuantity) {
      return next(new Error('buyQuantity and freeQuantity are required for buy-x-get-y-free offers'));
    }
    this.purchaseQuantity = undefined;
    this.discountedPrice = undefined;
  }

  next();
});

// Static helpers (single "now" for consistency)
offerSchema.statics.getActiveOffersForItem = function (menuItemId) {
  const now = new Date();
  return this.find({
    menuItemId,
    isActive: true,
    startDate: { $lte: now },
    $or: [{ endDate: { $gte: now } }, { endDate: { $exists: false } }, { endDate: null }],
  }).populate('menuItemId', 'name totalPrice photos');
};

offerSchema.statics.getActiveOffersForBusiness = function (businessId) {
  const now = new Date();
  return this.find({
    businessId,
    isActive: true,
    startDate: { $lte: now },
    $or: [{ endDate: { $gte: now } }, { endDate: { $exists: false } }, { endDate: null }],
  }).populate('menuItemId', 'name totalPrice photos category');
};

module.exports = mongoose.models.Offer || mongoose.model('Offer', offerSchema);
