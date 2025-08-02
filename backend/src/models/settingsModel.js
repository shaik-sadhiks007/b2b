const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    // GST Settings
    gstSettings: {
        // Default GST percentage (fallback if category not specified)
        defaultGstPercentage: {
            type: Number,
            default: 5
        },
        // Category-specific GST percentages
        categoryGstPercentages: {
            pharma: {
                type: Number,
                default: 12
            },
            grocery: {
                type: Number,
                default: 2
            },
            restaurant: {
                type: Number,
                default: 5
            },
            others: { // Generic fallback for categories not explicitly listed
                type: Number,
                default: 5
            }
        }
    },

    // Delivery Settings
    deliverySettings: {
        // Flat delivery charge (for flat type)
        flatDeliveryCharge: {
            type: Number,
            default: 30
        },
        
        // Threshold settings (for threshold type)
        deliveryThresholdAmount: {
            type: Number,
            default: 500
        },
        freeDeliveryAboveThreshold: { // Whether delivery is free above threshold
            type: Boolean,
            default: true
        },
        
       
        maxDeliveryDistance: { // Distance beyond which additional charges apply
            type: Number,
            default: 10 // km
        },
        additionalChargePerKm: { // Additional charge per km beyond maxDeliveryDistance
            type: Number,
            default: 15
        },
        
      
        maxDeliveryWeight: { // Weight beyond which additional charges apply
            type: Number,
            default: 15 // kg
        },
        additionalChargePerKg: { // Additional charge per kg beyond maxDeliveryWeight
            type: Number,
            default: 8
        },
        
        // Minimum order amount for delivery
        minimumOrderAmount: {
            type: Number,
            default: 100
        }
    },

    // Settings metadata
    isActive: { // Only one admin default setting should be active at a time
        type: Boolean,
        default: true
    },
    
    // This will always be 'admin_default' for this model
    settingsType: {
        type: String,
        enum: ['admin_default'],
        default: 'admin_default',
        required: true,
        unique: true // Ensure only one admin default setting exists
    },

    // Created by (admin user)
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Ensure only one active admin_default setting
settingsSchema.pre('save', async function(next) {
    if (this.isModified('isActive') && this.isActive && this.settingsType === 'admin_default') {
        await this.constructor.updateMany(
            { _id: { $ne: this._id }, settingsType: 'admin_default', isActive: true },
            { $set: { isActive: false } }
        );
    }
    next();
});

// Check if the model exists before creating it
const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);

module.exports = Settings; 