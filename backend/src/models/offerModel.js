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
    required: true,
    default: 'bulk-price'
  },
  
  // Common fields for both offer types
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
  
  // Fields for bulk-price offer (e.g., buy 2 for ₹180)
  purchaseQuantity: {
    type: Number,
    min: 1,
    required: function() { return this.offerType === 'bulk-price'; }
  },
  discountedPrice: {
    type: Number,
    min: 1,
    required: function() { return this.offerType === 'bulk-price'; }
  },
  
  // Fields for buy-x-get-y-free offer
  buyQuantity: {
    type: Number,
    min: 1,
    required: function() { return this.offerType === 'buy-x-get-y-free'; }
  },
  freeQuantity: {
    type: Number,
    min: 1,
    required: function() { return this.offerType === 'buy-x-get-y-free'; }
  },
  
  // Offer validity
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for dynamic offer display text
offerSchema.virtual('displayText').get(function() {
  if (!this.populated('menuItemId')) return null;
  
  const itemName = this.menuItemId.name;
  const itemPrice = this.menuItemId.totalPrice;
  
  switch(this.offerType) {
    case 'bulk-price':
      const savings = (itemPrice * this.purchaseQuantity) - this.discountedPrice;
      return `Buy ${this.purchaseQuantity} ${itemName} for ₹${this.discountedPrice} (Save ₹${savings})`;
      
    case 'buy-x-get-y-free':
      return `Buy ${this.buyQuantity} Get ${this.freeQuantity} Free - Effective price ₹${((this.buyQuantity * itemPrice) / (this.buyQuantity + this.freeQuantity)).toFixed(2)} per item`;
      
    default:
      return this.title;
  }
});

// Virtual for calculating discount percentage
offerSchema.virtual('discountPercentage').get(function() {
  if (!this.populated('menuItemId')) return null;
  
  const itemPrice = this.menuItemId.totalPrice;
  
  switch(this.offerType) {
    case 'bulk-price':
      const originalPrice = itemPrice * this.purchaseQuantity;
      return Math.round(((originalPrice - this.discountedPrice) / originalPrice) * 100);
      
    case 'buy-x-get-y-free':
      return Math.round((this.freeQuantity / (this.buyQuantity + this.freeQuantity)) * 100);
      
    default:
      return 0;
  }
});

// Indexes for performance
offerSchema.index({ menuItemId: 1 });
offerSchema.index({ businessId: 1 });
offerSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

// Validation to ensure offer makes sense
offerSchema.pre('save', async function(next) {
  const menuItem = await mongoose.model('Menu').findById(this.menuItemId);
  
  if (this.offerType === 'bulk-price') {
    const originalPrice = menuItem.totalPrice * this.purchaseQuantity;
    if (this.discountedPrice >= originalPrice) {
      throw new Error('Discounted price should be less than original price');
    }
  }
  
  if (this.offerType === 'buy-x-get-y-free') {
    if (this.freeQuantity >= this.buyQuantity && this.buyQuantity !== 1) {
      throw new Error('Free quantity should generally be less than purchase quantity for meaningful offers');
    }
  }
  
  if (this.endDate && this.endDate <= this.startDate) {
    throw new Error('End date must be after start date');
  }
  
  next();
});

// Static methods for common queries
offerSchema.statics.getActiveOffersForItem = function(menuItemId) {
  return this.find({
    menuItemId,
    isActive: true,
    startDate: { $lte: new Date() },
    $or: [
      { endDate: { $gte: new Date() } },
      { endDate: { $exists: false } }
    ]
  }).populate('menuItemId', 'totalPrice name');
};

offerSchema.statics.getActiveOffersForBusiness = function(businessId) {
  return this.find({
    businessId,
    isActive: true,
    startDate: { $lte: new Date() },
    $or: [
      { endDate: { $gte: new Date() } },
      { endDate: { $exists: false } }
    ]
  }).populate('menuItemId', 'totalPrice name category');
};

const Offer = mongoose.models.Offer || mongoose.model('Offer', offerSchema);
module.exports = Offer;