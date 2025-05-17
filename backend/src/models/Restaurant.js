const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    restaurantName: {
        type: String,
        required: true
    },
    serviceType: {
        type: String,
        enum: ['DELIVERY', 'PICKUP', 'BOTH'],
        default: 'DELIVERY'
    },
    ownerName: {
        type: String,
        required: true
    },
    
    sameAsOwnerPhone: {
        type: Boolean,
        default: false
    },
    whatsappUpdates: {
        type: Boolean,
        default: false
    },
    category: {
        type: String
    },
    address: {
        shopNo: String,
        floor: String,
        locality: String,
        landmark: String,
        city: String,
        fullAddress: String
    },
    location: {
        lat: Number,
        lng: Number
    },
    contact: {
        primaryPhone: String,
        whatsappNumber: String,
        email: String,
        website: String
    },
    operatingHours: {
        defaultOpenTime: String,
        defaultCloseTime: String,
        timeSlots: {
            monday: { isOpen: Boolean, openTime: String, closeTime: String },
            tuesday: { isOpen: Boolean, openTime: String, closeTime: String },
            wednesday: { isOpen: Boolean, openTime: String, closeTime: String },
            thursday: { isOpen: Boolean, openTime: String, closeTime: String },
            friday: { isOpen: Boolean, openTime: String, closeTime: String },
            saturday: { isOpen: Boolean, openTime: String, closeTime: String },
            sunday: { isOpen: Boolean, openTime: String, closeTime: String }
        }
    },
    images: {
        profileImage: String,
        panCardImage: String,
        gstImage: String,
        fssaiImage: String
    },
    panDetails: {
        panNumber: String,
        name: String,
        dateOfBirth: String,
        address: String
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived','review','rejected'],
        default: 'draft'
    },
    currentStep: {
        type: Number,
        default: 1
    },
    completedSteps: [{
        step: Number,
        completedAt: Date,
        data: mongoose.Schema.Types.Mixed
    }]
}, {
    timestamps: true
});

// Index for location-based queries
restaurantSchema.index({ location: '2dsphere' });

// Check if the model exists before creating it
const Restaurant = mongoose.models.Restaurant || mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant; 