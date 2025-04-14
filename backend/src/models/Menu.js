const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    foodType: {
        type: String,
        enum: ['Veg', 'Non-Veg', 'Egg'],
        required: true
    },
    customisable: {
        type: Boolean,
        default: false
    },
    basePrice: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    isVeg: {
        type: Boolean,
        required: true
    },
    photos: [{
        type: String
    }],
    serviceType: {
        type: String,
        enum: ['Delivery', 'Dine-in', 'Both'],
        required: true
    },
    totalPrice: {
        type: String,
        required: true
    },
    packagingCharges: {
        type: String,
        required: true
    },
    inStock: {
        type: Boolean,
        default: true
    }
});

const subcategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    items: [menuItemSchema]
});

const categorySchema = new mongoose.Schema({
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    isExpanded: {
        type: Boolean,
        default: true
    },
    subcategories: [subcategorySchema]
});

// Check if the model exists before creating it
const Menu = mongoose.models.MenuOfRestaurant || mongoose.model('MenuOfRestaurant', categorySchema);

module.exports = Menu; 