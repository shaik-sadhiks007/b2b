const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        default: "uncategorized",
        lowercase: true,
        trim: true
    },
    subcategory: {
        type: String,
        default: "general",
        lowercase: true,
        trim: true
    },
    foodType: {
        type: String,
        enum: ['veg', 'nonveg', 'egg'],
        default: 'veg',
    },
    // customisable: {
    //     type: Boolean,
    //     default: false
    // },
    // basePrice: {
    //     type: String,
    //     required: true
    // },
    description: {
        type: String,
    },
    photos: {
        type: String
    },
    // serviceType: {
    //     type: String,
    //     enum: ['Delivery', 'Dine-in', 'Both'],
    // },
    totalPrice: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        enum: ['kg', 'ltr', 'piece', 'box', 'plate', 'bottle', 'cup', 'packet'],
        default: 'piece'
    },
    // packagingCharges: {
    //     type: String,
    // },
    inStock: {
        type: Boolean,
        default: true
    },
    quantity: {
        type: Number,
        default: 100
    },

     expiryDate: {
        type: Date,
        required: false  
    },

     storageZone: {
        type: String,
        enum: ['general', 'refrigerated', 'controlled', 'hazardous'],
        default: 'general'
    },
    rack: {
        type: String,
        uppercase: true,
        trim: true,
        required: false, // Add this
  validate: {
    validator: function(v) {
      return !v || /^[A-Z0-9-]{1,5}$/.test(v); // Allow empty or valid format
    },
    message: props => `${props.value} is not a valid rack identifier!`
  }
    },
    shelf: {
        type: String,
        uppercase: true,
        trim: true
    },
    bin: {
        type: String,
        uppercase: true,
        trim: true
    },
     batchNumber: {
        type: String,
        uppercase: true,
        trim: true
    },
    requiresPrescription: {
        type: Boolean,
        default: false
    }


}, {
    timestamps: true
});

// Compound index
menuItemSchema.index({ category: 1, subcategory: 1 });

// Check if the model exists before creating it
const Menu = mongoose.models.Menu || mongoose.model('Menu', menuItemSchema);

module.exports = Menu; 