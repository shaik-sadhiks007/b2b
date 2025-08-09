const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    restaurantName: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    serviceType: {
        type: String,
        enum: ['delivery', 'pickup', 'both'],
        default: 'delivery'
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
        streetAddress: { type: String },
        city: { type: String },
        state: { type: String },
        country: { type: String, default: "india" },
        pinCode: { type: String }
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
        enum: ['draft', 'published', 'archived', 'review', 'rejected'],
        default: 'draft'
    },
    online: {
        type: Boolean,
        default: false
    },
    currentStep: {
        type: Number,
        default: 1
    },
    completedSteps: [{
        step: Number,
        completedAt: Date,
        data: mongoose.Schema.Types.Mixed
    }],
    subdomain: {
        type: String,
        unique: true,
        sparse: true,
        index: true
    }
}, {
    timestamps: true
});

// Index for location-based queries
businessSchema.index({ location: '2dsphere' });

// Pre-save hook to handle subdomain
businessSchema.pre('save', function(next) {
    // If subdomain is null or empty string, set it to undefined to avoid unique constraint issues
    if (this.subdomain === null || this.subdomain === '') {
        this.subdomain = undefined;
    }
    next();
});

// Check if the model exists before creating it
const Business = mongoose.models.Business || mongoose.model('Business', businessSchema);

module.exports = Business; 