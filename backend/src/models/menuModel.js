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
    }
});

// Compound index
menuItemSchema.index({ category: 1, subcategory: 1 });

// Check if the model exists before creating it
const Menu = mongoose.models.Menu || mongoose.model('Menu', menuItemSchema);

module.exports = Menu; 