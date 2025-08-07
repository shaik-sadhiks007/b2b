const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: "uncategorized",
      lowercase: true,
      trim: true,
    },
    subcategory: {
      type: String,
      default: "general",
      lowercase: true,
      trim: true,
    },
    foodType: {
      type: String,
      enum: ["veg", "nonveg", "egg"],
      default: "veg",
    },
    description: {
      type: String,
    },
    photos: {
      type: String,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0.01
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
      validate: {
        validator: function(v) {
          // Ensure discount doesn't make price zero
          return v === 0 || this.totalPrice * (1 - v/100) > 0;
        },
        message: "Discount would make the price zero or negative"
      }
    },
    unit: {
      type: String,
      required: true,
      enum: [
        "grams",
        "ml",
        "kg",
        "ltr",
        "piece",
        "box",
        "plate",
        "bottle",
        "cup",
        "packet",
      ],
      default: "piece",
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    quantity: {
      type: Number,
      default: 100,
    },
    loose: {
      type: Boolean,
      default: false,
    },
    expiryDate: {
      type: Date,
      required: false,
    },
    unitValue: {
      type: Number,
      required: true,
      min: [0.01, "Unit value must be greater than zero"],
      default: 1,
    },
    storageZone: {
      type: String,
      enum: ["general", "refrigerated", "controlled", "hazardous"],
      default: "general",
    },
    rack: {
      type: String,
      uppercase: true,
      trim: true,
      required: false,
      validate: {
        validator: function (v) {
          return !v || /^[A-Z0-9-]{1,5}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid rack identifier!`,
      },
    },
    shelf: {
      type: String,
      uppercase: true,
      trim: true,
    },
    bin: {
      type: String,
      uppercase: true,
      trim: true,
    },
    batchNumber: {
      type: String,
      uppercase: true,
      trim: true,
    },
    requiresPrescription: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for current price (after discount)
menuItemSchema.virtual('currentPrice').get(function() {
  return parseFloat((this.totalPrice * (1 - this.discountPercentage / 100)).toFixed(2));
});

// Virtual for discount amount (money saved)
menuItemSchema.virtual('discountAmount').get(function() {
  return parseFloat((this.totalPrice * (this.discountPercentage / 100)).toFixed(2));
});

// Virtual for checking if item is on discount
menuItemSchema.virtual('isOnDiscount').get(function() {
  return this.discountPercentage > 0;
});

// Method to apply a discount (by percentage)
menuItemSchema.methods.applyDiscount = function(percentage) {
  if (percentage < 0 || percentage > 100) {
    throw new Error('Discount percentage must be between 0 and 100');
  }
  this.discountPercentage = percentage;
  return this;
};

// Method to set a specific discounted price
menuItemSchema.methods.setDiscountedPrice = function(discountedPrice) {
  if (discountedPrice >= this.totalPrice) {
    this.discountPercentage = 0;
  } else if (discountedPrice <= 0) {
    throw new Error('Discounted price must be greater than zero');
  } else {
    const calculatedPercentage = 100 - (discountedPrice / this.totalPrice * 100);
    this.discountPercentage = parseFloat(calculatedPercentage.toFixed(2));
  }
  return this;
};

// Method to remove discount
menuItemSchema.methods.removeDiscount = function() {
  this.discountPercentage = 0;
  return this;
};

// Compound index
menuItemSchema.index({ category: 1, subcategory: 1 });

// Check if the model exists before creating it
const Menu = mongoose.models.Menu || mongoose.model("Menu", menuItemSchema);

module.exports = Menu;