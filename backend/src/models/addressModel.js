const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    streetAddress: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    postalCode: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    businessHours: {
        open: {
            type: String,
            default: '09:00'
        },
        close: {
            type: String,
            default: '22:00'
        }
    },
    socialMedia: {
        facebook: String,
        twitter: String,
        instagram: String
    }
}, {
    timestamps: true
});

// Index for location-based queries
addressSchema.index({ location: '2dsphere' });

// Method to format the address as a string
addressSchema.methods.getFullAddress = function() {
    return `${this.streetAddress}, ${this.city}, ${this.state} ${this.postalCode}, ${this.country}`;
};

// Ensure only one active address exists
addressSchema.pre('save', async function(next) {
    if (this.isActive) {
        await this.constructor.updateMany(
            { _id: { $ne: this._id } },
            { isActive: false }
        );
    }
    next();
});

const Address = mongoose.model('Address', addressSchema);

module.exports = Address; 