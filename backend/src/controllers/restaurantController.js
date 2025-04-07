const Restaurant = require('../models/restaurantModel');
const asyncHandler = require('express-async-handler');
const { cloudinary } = require('../config/cloudinary');

// @desc    Save restaurant information (Step 1)
// @route   POST /api/restaurant/info
// @access  Private
const saveRestaurantInfo = asyncHandler(async (req, res) => {
    const {
        restaurantName,
        ownerName,
        ownerEmail,
        ownerPhone,
        restaurantPhone,
        address,
        whatsappUpdates,
        sameAsOwnerPhone,
        location
    } = req.body;

    // Handle image uploads
    const images = req.files ? req.files.map(file => file.path) : [];

    // Create or update restaurant info
    const restaurant = await Restaurant.findOneAndUpdate(
        { ownerEmail },
        {
            restaurantName,
            ownerName,
            ownerEmail,
            ownerPhone,
            restaurantPhone,
            address,
            whatsappUpdates,
            sameAsOwnerPhone,
            location,
            'images.restaurant': images,
            registrationStep: 1
        },
        { upsert: true, new: true }
    );

    res.status(200).json({
        success: true,
        data: restaurant
    });
});

// @desc    Save menu details (Step 2)
// @route   POST /api/restaurant/menu
// @access  Private
const saveMenuDetails = asyncHandler(async (req, res) => {
    const {
        category,
        deliveryTiming
    } = req.body;

    // Handle image uploads
    const images = req.files ? req.files.map(file => file.path) : [];

    const restaurant = await Restaurant.findOneAndUpdate(
        { ownerEmail: req.user.email },
        {
            category,
            deliveryTiming,
            'images.food': images,
            registrationStep: 2
        },
        { new: true }
    );

    if (!restaurant) {
        res.status(404);
        throw new Error('Restaurant not found');
    }

    res.status(200).json({
        success: true,
        data: restaurant
    });
});

// @desc    Save PAN card details (Step 3)
// @route   POST /api/restaurant/pan-card
// @access  Private
const savePanCardDetails = asyncHandler(async (req, res) => {
    const {
        panDetails
    } = req.body;

    // Handle PAN card image upload
    const panCardImage = req.file ? req.file.path : null;

    const restaurant = await Restaurant.findOneAndUpdate(
        { ownerEmail: req.user.email },
        {
            panDetails,
            panCardImage,
            registrationStep: 3
        },
        { new: true }
    );

    if (!restaurant) {
        res.status(404);
        throw new Error('Restaurant not found');
    }

    res.status(200).json({
        success: true,
        data: restaurant
    });
});

// @desc    Save terms and conditions (Step 4)
// @route   POST /api/restaurant/terms
// @access  Private
const saveTermsAndConditions = asyncHandler(async (req, res) => {
    const { termsAccepted } = req.body;

    const restaurant = await Restaurant.findOneAndUpdate(
        { ownerEmail: req.user.email },
        {
            termsAccepted,
            registrationStep: 4,
            registrationCompleted: true
        },
        { new: true }
    );

    if (!restaurant) {
        res.status(404);
        throw new Error('Restaurant not found');
    }

    res.status(200).json({
        success: true,
        data: restaurant
    });
});

module.exports = {
    saveRestaurantInfo,
    saveMenuDetails,
    savePanCardDetails,
    saveTermsAndConditions
}; 