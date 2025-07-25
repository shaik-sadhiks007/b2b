const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required: true 
    },
    customerName: {
        type: String,
        default: "Customer"
    },
    customerPhone: {
        type: Number,
        default: 0,
    },
    items: [{
        itemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Menu",
            required: true
        },
        name: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        totalPrice: {
            type: Number,
            required: true
        },
        photos: [{
            type: String
        }],
        foodType: {
            type: String,
            required: true
        }
    }],
    customerAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CustomerAddress",
        required: false
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ["COD", "ONLINE"]
    },
    paymentStatus: {
        type: String,
        required: true,
        enum: ["PENDING", "COMPLETED", "FAILED"]
    },
    status: {
        type: String,
        required: true,
        enum: ["ORDER_PLACED", "ACCEPTED", "ORDER_DELIVERY_READY","ORDER_PICKUP_READY", "OUT_FOR_DELIVERY", "ORDER_DELIVERED", "CANCELLED", "ORDER_PICKED_UP","INSTORE_ORDER"],
        default: "ORDER_PLACED"
    },
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Business",
        required: true
    },
    restaurantName: {
        type: String,
        required: true
    },
    orderType: {
        type: String,
        required: true,
        enum: ["pickup", "delivery"]
    },
    deliveryTime: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
        max: 120
    },
    deliveryPartnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DeliveryPartner",
        required: false, // Required only if status is ORDER_DELIVERY_READY
    },
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
