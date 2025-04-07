const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    items: [{
        menuName: String,
        quantity: Number,
        price: Number
    }],
    shippingDetails: {
        name: String,
        phone: String,
        address: String,
        city: String,
        state: String,
        pincode: String,
        email: String
    },
    totalAmount: Number,
    paymentMethod: String,
    status: { 
        type: String, 
        enum: ["Order Placed", "Ready to Pickup", "Cancelled", "Picked Up"],
        default: "Order Placed" 
    },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
